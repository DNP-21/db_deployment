#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting MongoDB containers..."
docker compose up -d

echo "⏳ Waiting for MongoDB nodes to start accepting connections..."
# Sleep for a few seconds to let the mongod processes start
sleep 5

echo "Initializing the replica set..."
docker cp init_replica.js mongo-primary:/tmp/init_replica.js

docker exec mongo-primary mongosh /tmp/init_replica.js

echo "Local distributed cluster is up and running!"
echo "Primary port: 27017"
echo "Secondary ports: 27018, 27019"
echo "To connect to the primary via shell, run: docker exec -it mongo-primary mongosh"
