import subprocess
import sys
import time
from pathlib import Path


NETWORK = "db_deployment_mongo-cluster"
SECONDARY = "mongo-secondary-1"
SURVIVING_SECONDARY = "mongo-secondary-2"
NODES = ["mongo-primary", "mongo-secondary-1", "mongo-secondary-2"]
BASE_DIR = Path(__file__).resolve().parent.parent


def run(args, *, check=True, quiet=False):
    if not quiet:
        print("+ " + " ".join(args), flush=True)
    completed = subprocess.run(args, text=True, capture_output=True)
    if check and completed.returncode != 0:
        if completed.stdout:
            print(completed.stdout, end="")
        if completed.stderr:
            print(completed.stderr, end="", file=sys.stderr)
        raise SystemExit(completed.returncode)
    return completed


def container_running(node):
    result = run(
        ["docker", "inspect", "-f", "{{.State.Running}}", node],
        check=False,
        quiet=True,
    )
    return result.returncode == 0 and result.stdout.strip() == "true"


def wait_for_primary(timeout=60):
    deadline = time.time() + timeout
    while time.time() < deadline:
        for node in NODES:
            if not container_running(node):
                continue

            result = run(
                ["docker", "exec", node, "mongosh", "--quiet", "--eval", "db.hello().isWritablePrimary"],
                check=False,
                quiet=True,
            )
            if result.returncode == 0 and "true" in result.stdout:
                return node

        time.sleep(2)

    raise RuntimeError(f"No writable primary found within {timeout} seconds")


def read_check(node):
    print(f"Checking read availability on {node}...", flush=True)
    run(["docker", "cp", str(BASE_DIR / "tests" / "read_availability.js"), f"{node}:/tmp/read_availability.js"], quiet=True)
    run(["docker", "exec", node, "mongosh", "--quiet", "/tmp/read_availability.js"])


def restart_secondary():
    run(["docker", "start", SECONDARY], check=False)
    run(["docker", "network", "connect", NETWORK, SECONDARY], check=False)


def main():
    print("Cleaning previous containers (if any)...", flush=True)
    for node in NODES:
        run(["docker", "rm", "-f", node], check=False, quiet=True)

    print("Starting MongoDB containers...", flush=True)
    run(["docker", "compose", "-f", str(BASE_DIR / "docker-compose.yaml"), "up", "-d"])
    time.sleep(8)

    print("Initializing replica set...", flush=True)
    run(["docker", "cp", str(BASE_DIR / "mongo" / "init_replica.js"), "mongo-primary:/tmp/init_replica.js"])
    run(["docker", "exec", "mongo-primary", "mongosh", "/tmp/init_replica.js"])

    initial_primary = wait_for_primary(60)
    print(f"Initial primary: {initial_primary}", flush=True)

    print("Loading test data...", flush=True)
    run(["docker", "cp", str(BASE_DIR / "tests" / "dump.js"), f"{initial_primary}:/tmp/dump.js"], quiet=True)
    run(["docker", "exec", initial_primary, "mongosh", "--quiet", "/tmp/dump.js"])

    read_check(SECONDARY)
    read_check(SURVIVING_SECONDARY)

    print(f"Failure 1: stop one secondary container ({SECONDARY}).", flush=True)
    run(["docker", "stop", SECONDARY])
    time.sleep(5)
    read_check(SURVIVING_SECONDARY)

    print(f"Restart failed replica ({SECONDARY}).", flush=True)
    restart_secondary()
    time.sleep(10)
    read_check(SECONDARY)

    print("Failure 2: pause network between primary and one secondary using docker network disconnect.", flush=True)
    run(["docker", "network", "disconnect", NETWORK, SECONDARY])
    time.sleep(5)
    read_check(SURVIVING_SECONDARY)

    print("Reconnect network-isolated replica.", flush=True)
    restart_secondary()
    time.sleep(10)
    read_check(SECONDARY)

    current_primary = wait_for_primary(60)
    print(f"Failure 3: stop current primary and verify automatic re-election ({current_primary}).", flush=True)
    run(["docker", "stop", current_primary])
    new_primary = wait_for_primary(90)
    print(f"New primary after failover: {new_primary}", flush=True)

    if new_primary == current_primary:
        raise RuntimeError("Failover check failed: primary did not change")

    read_check(new_primary)

    print("Recover stopped primary.", flush=True)
    run(["docker", "start", current_primary])
    time.sleep(15)

    final_primary = wait_for_primary(90)
    print(f"Final writable primary: {final_primary}", flush=True)

    for node in NODES:
        if container_running(node):
            read_check(node)

    print("Failure automation completed successfully.", flush=True)


if __name__ == "__main__":
    main()
