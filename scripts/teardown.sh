#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Stopping and removing MongoDB containers..."
docker compose -f "$REPO_ROOT/docker-compose.yaml" down -v
echo "Teardown complete!"
