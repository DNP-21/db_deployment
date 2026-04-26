import subprocess
import sys
import time
from datetime import datetime, timezone

INTERVAL = int(sys.argv[1]) if len(sys.argv) > 1 else 5
LOG_FILE = "monitoring/lag.log"

NODES = ["mongo-primary", "mongo-secondary-1", "mongo-secondary-2"]

# JS script that reads lag for each secondary from rs.status()
LAG_SCRIPT = """
const s = rs.status();
const primary = s.members.find(m => m.stateStr === 'PRIMARY');
if (!primary) { print('NO_PRIMARY'); quit(); }
s.members.filter(m => m.stateStr === 'SECONDARY').forEach(m => {
    const lag = primary.optime.ts.t - m.optime.ts.t;
    print(m.name + '  lag=' + lag + 's  health=' + m.health + '  pingMs=' + m.pingMs);
});
"""

print(f"Lag tracker started, polling every {INTERVAL}s. Log: {LOG_FILE}")
print("Press Ctrl+C to stop.\n")

log = open(LOG_FILE, "a")

while True:
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    output = None

    # try each node until we get a response from a primary
    for node in NODES:
        result = subprocess.run(
            ["docker", "exec", node, "mongosh", "--quiet", "--eval", LAG_SCRIPT],
            text=True,
            capture_output=True,
        )
        if result.returncode == 0 and result.stdout.strip():
            output = result.stdout.strip()
            break

    if output:
        for line in output.splitlines():
            entry = f"[{ts}] {line}"
            print(entry)
            log.write(entry + "\n")
    else:
        entry = f"[{ts}] no reachable primary"
        print(entry)
        log.write(entry + "\n")

    log.flush()
    time.sleep(INTERVAL)
