#!/bin/bash

echo "Stopping and removing MongoDB containers..."
docker compose down -v
echo "Teardown complete!"
