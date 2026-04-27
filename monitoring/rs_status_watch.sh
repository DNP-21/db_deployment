#!/bin/bash
# Prints rs.status() before, during, and after a simulated failure.
# Usage: ./monitoring/rs_status_watch.sh [failure_type]
# Failure types: stop_secondary (default), disconnect_secondary, stop_primary

FAILURE="${1:-stop_secondary}"
SETTLE=5

print_status() {
    local label=$1
    echo "rs.status() — $label"
    echo "Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

    # try each node until we find one that responds
    for node in mongo-primary mongo-secondary-1 mongo-secondary-2; do
        ok=$(docker exec "$node" mongosh --quiet --eval "rs.status().ok" 2>/dev/null)
        if [ "$ok" = "1" ]; then
            docker exec "$node" mongosh --quiet --eval "
                rs.status().members.forEach(m => {
                    print(m.name + ' | ' + m.stateStr + ' | health=' + m.health + ' | pingMs=' + m.pingMs);
                });
            " 2>/dev/null
            echo ""
            return
        fi
    done

    echo "(no reachable node)"
    echo ""
}

print_status "BEFORE failure"

echo "Injecting failure: $FAILURE"
./simulate_failure.sh "$FAILURE"
echo ""

echo "Waiting ${SETTLE}s for cluster to react"
sleep $SETTLE

print_status "DURING failure"

echo "Recovering cluster"
./simulate_failure.sh recover
echo ""

echo "Waiting ${SETTLE}s for recovery"
sleep $SETTLE

print_status "AFTER recovery"
