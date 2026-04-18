#!/bin/bash

case "$1" in
    stop_primary)
        echo "Stopping the primary node..."
        docker stop mongo-primary
        echo "Primary stopped. Run 'docker exec -it mongo-secondary-1 mongosh --eval \"rs.status()\"' to observe the election."
        ;;
    network_partition)
        echo "Simulating network partition on secondary-1..."
        docker pause mongo-secondary-1
        echo "Secondary-1 paused."
        ;;
    recover)
        echo "Recovering failed nodes..."
        docker start mongo-primary 2>/dev/null || true
        docker unpause mongo-secondary-1 2>/dev/null || true
        echo "Nodes recovered."
        ;;
    *)
        echo "Usage: $0 {stop_primary|network_partition|recover}"
        exit 1
esac
