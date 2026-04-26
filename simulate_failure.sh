#!/bin/bash

set -euo pipefail

NETWORK="${NETWORK:-db_deployment_mongo-cluster}"
SECONDARY="${SECONDARY:-mongo-secondary-1}"

usage() {
    echo "Usage: $0 {stop_primary|stop_secondary|disconnect_secondary|restart_secondary|recover}"
    echo
    echo "Environment overrides:"
    echo "  SECONDARY=<container>  default: mongo-secondary-1"
    echo "  NETWORK=<network>      default: db_deployment_mongo-cluster"
}

case "${1:-}" in
    stop_primary)
        echo "Stopping the primary node..."
        docker stop mongo-primary
        echo "Primary stopped. Run 'docker exec -it mongo-secondary-1 mongosh --eval \"rs.status()\"' to observe the election."
        ;;
    stop_secondary)
        echo "Stopping secondary node: $SECONDARY..."
        docker stop "$SECONDARY"
        echo "$SECONDARY stopped."
        ;;
    disconnect_secondary|network_partition)
        echo "Disconnecting $SECONDARY from Docker network $NETWORK..."
        docker network disconnect "$NETWORK" "$SECONDARY"
        echo "$SECONDARY is network-isolated from the replica set."
        ;;
    restart_secondary)
        echo "Restarting and reconnecting failed secondary node: $SECONDARY..."
        docker start "$SECONDARY" >/dev/null 2>&1 || true
        docker network connect "$NETWORK" "$SECONDARY" >/dev/null 2>&1 || true
        echo "$SECONDARY restarted/reconnected."
        ;;
    recover)
        echo "Recovering failed nodes..."
        docker start mongo-primary >/dev/null 2>&1 || true
        docker start "$SECONDARY" >/dev/null 2>&1 || true
        docker network connect "$NETWORK" "$SECONDARY" >/dev/null 2>&1 || true
        echo "Nodes recovered."
        ;;
    *)
        usage
        exit 1
esac
