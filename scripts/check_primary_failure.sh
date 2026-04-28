#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Cleaning previous containers (if any)..."
docker rm -f mongo-primary mongo-secondary-1 mongo-secondary-2 > /dev/null 2>&1 || true

echo "Setup of database cluster with 1 primary and 2 replicas"
"$SCRIPT_DIR/setup.sh" > /dev/null 2>&1

echo "Waiting for MongoDB to be ready..."
sleep 10

echo "Dumping from tests/dump.js"
docker cp "$REPO_ROOT/tests/dump.js" mongo-primary:/tmp/dump.js > /dev/null
docker exec mongo-primary mongosh /tmp/dump.js > /dev/null

echo "Checking consistency of the data"
docker cp "$REPO_ROOT/tests/check_consistency.js" mongo-primary:/tmp/check_consistency.js > /dev/null
docker exec mongo-primary mongosh /tmp/check_consistency.js

echo "Simulating primary failure by stopping the primary container..."
"$SCRIPT_DIR/simulate_failure.sh" stop_primary > /dev/null

sleep 5

echo "Checking data from secondary containers"

for node in mongo-secondary-1 mongo-secondary-2
do
  echo "Checking consistency on $node"
  
  docker cp "$REPO_ROOT/tests/check_consistency.js" $node:/tmp/check_consistency.js > /dev/null
  docker exec $node mongosh /tmp/check_consistency.js
done

echo "Detecting new primary..."
NEW_PRIMARY=""

for node in mongo-secondary-1 mongo-secondary-2
do
  if docker exec $node mongosh --quiet --eval "rs.isMaster().ismaster" | grep -q "true"; then
    NEW_PRIMARY=$node
  fi
done

echo "New primary is: $NEW_PRIMARY"

echo "Inserting new data into new primary"
docker cp "$REPO_ROOT/tests/test_insert.js" $NEW_PRIMARY:/tmp/test_insert.js > /dev/null
docker exec $NEW_PRIMARY mongosh /tmp/test_insert.js

sleep 3

echo "Recovering old primary..."
"$SCRIPT_DIR/simulate_failure.sh" recover > /dev/null

echo "Waiting for replication..."
sleep 10

echo "Checking data on recovered primary (mongo-primary)"

docker cp "$REPO_ROOT/tests/check_consistency.js" mongo-primary:/tmp/check_consistency.js > /dev/null
docker exec mongo-primary mongosh /tmp/check_consistency.js

echo "Done."
