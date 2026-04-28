#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

NETWORK="${NETWORK:-db_deployment_mongo-cluster}"
SECONDARY="${SECONDARY:-mongo-secondary-1}"
SURVIVING_SECONDARY="${SURVIVING_SECONDARY:-mongo-secondary-2}"
READ_SCRIPT="/tmp/read_availability.js"

copy_read_check() {
    local node="$1"
    docker cp "$REPO_ROOT/tests/read_availability.js" "$node:$READ_SCRIPT" >/dev/null
}

run_read_check() {
    local node="$1"
    echo "Checking read availability on $node..."
    copy_read_check "$node"
    docker exec "$node" mongosh --quiet "$READ_SCRIPT"
}

wait_for_primary() {
    local timeout="${1:-60}"
    local elapsed=0
    local nodes=(mongo-primary mongo-secondary-1 mongo-secondary-2)

    while [ "$elapsed" -lt "$timeout" ]; do
        for node in "${nodes[@]}"; do
            if ! docker inspect -f '{{.State.Running}}' "$node" 2>/dev/null | grep -q true; then
                continue
            fi

            if docker exec "$node" mongosh --quiet --eval 'db.hello().isWritablePrimary' 2>/dev/null | grep -q true; then
                echo "$node"
                return 0
            fi
        done

        sleep 2
        elapsed=$((elapsed + 2))
    done

    return 1
}

echo "Cleaning previous containers (if any)..."
docker rm -f mongo-primary mongo-secondary-1 mongo-secondary-2 >/dev/null 2>&1 || true

echo "Starting and initializing replica set..."
"$SCRIPT_DIR/setup.sh"

echo "Loading test data..."
docker cp "$REPO_ROOT/tests/dump.js" mongo-primary:/tmp/dump.js >/dev/null
docker exec mongo-primary mongosh --quiet /tmp/dump.js

echo "Initial primary:"
INITIAL_PRIMARY="$(wait_for_primary 60)"
echo "$INITIAL_PRIMARY"

run_read_check "$SECONDARY"
run_read_check "$SURVIVING_SECONDARY"

echo "Failure 1: stop one secondary container ($SECONDARY)."
SECONDARY="$SECONDARY" "$SCRIPT_DIR/simulate_failure.sh" stop_secondary
sleep 5
run_read_check "$SURVIVING_SECONDARY"

echo "Restart failed replica ($SECONDARY)."
SECONDARY="$SECONDARY" NETWORK="$NETWORK" "$SCRIPT_DIR/simulate_failure.sh" restart_secondary
sleep 10
run_read_check "$SECONDARY"

echo "Failure 2: pause network between primary and one secondary using docker network disconnect."
SECONDARY="$SECONDARY" NETWORK="$NETWORK" "$SCRIPT_DIR/simulate_failure.sh" disconnect_secondary
sleep 5
run_read_check "$SURVIVING_SECONDARY"

echo "Reconnect network-isolated replica."
SECONDARY="$SECONDARY" NETWORK="$NETWORK" "$SCRIPT_DIR/simulate_failure.sh" restart_secondary
sleep 10
run_read_check "$SECONDARY"

echo "Failure 3: stop current primary and verify automatic re-election."
CURRENT_PRIMARY="$(wait_for_primary 60)"
echo "Current primary before failure: $CURRENT_PRIMARY"
docker stop "$CURRENT_PRIMARY" >/dev/null

NEW_PRIMARY="$(wait_for_primary 90)"
echo "New primary after failover: $NEW_PRIMARY"

if [ "$NEW_PRIMARY" = "$CURRENT_PRIMARY" ]; then
    echo "Failover check failed: primary did not change."
    exit 1
fi

run_read_check "$NEW_PRIMARY"

echo "Recover stopped primary."
docker start "$CURRENT_PRIMARY" >/dev/null
sleep 15

FINAL_PRIMARY="$(wait_for_primary 90)"
echo "Final writable primary: $FINAL_PRIMARY"

for node in mongo-primary mongo-secondary-1 mongo-secondary-2; do
    if docker inspect -f '{{.State.Running}}' "$node" 2>/dev/null | grep -q true; then
        run_read_check "$node"
    fi
done

echo "Failure automation completed successfully."
