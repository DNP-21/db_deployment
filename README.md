# MongoDB Replica Set

That repository contains docker compose files and some shell files
for setting up local cluster of Mongo databases, simulating failures
and tearing down the setup

### Start and initialize the cluster
Starts containers and sets up them using `init_replica.js`
```shell
./setup_local.sh
```

### Testing & Validation
- Crash the Primary: `./simulate_failure.sh stop_primary`
- Isolate a Secondary: `./simulate_failure.sh network_partition`
- Restore all nodes: `./simulate_failure.sh recover`

### Teardown
Completely stops the cluster and wipes all test data
```shell
./teardown_local.sh
```

# Testing

File `check_primary_failure.sh` checks consistency of data in primary and secondary in case primary fails.

Scenario is the following:
1. Setup
2. Dumping in primary and checking amount of data
3. Crashing primary
4. Checking data in secondary and pushing new data to them
5. Restoring primary and checking if updates from secondary are in it
``` shell
./check_primary_failure.sh
```