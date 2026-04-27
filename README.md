# MongoDB Replica Set

That repository contains docker compose files and some shell files
for setting up local cluster of Mongo databases, simulating failures
and tearing down the setup

### Start and initialize the cluster
Starts containers and sets up them using `init_replica.js`
```shell
./setup.sh
```

### Testing & Validation
- Crash the Primary: `./simulate_failure.sh stop_primary`
- Stop a Secondary: `./simulate_failure.sh stop_secondary`
- Isolate a Secondary with Docker network disconnect: `./simulate_failure.sh disconnect_secondary`
- Restart/reconnect a failed Secondary: `./simulate_failure.sh restart_secondary`
- Restore all nodes: `./simulate_failure.sh recover`
- Run automated failure injection and failover verification: `python automate_failures.py`

### Teardown
Completely stops the cluster and wipes all test data
```shell
./teardown.sh
```

# Monitoring

Scripts for measuring replication lag, oplog stats, data consistency and replica set status.

### Replication lag
Shows lag per secondary using `rs.printSecondaryReplicationInfo()` and custom metrics from `rs.status()`:
```shell
docker cp monitoring/replication_lag.js mongo-primary:/tmp/ && \
docker exec mongo-primary mongosh /tmp/replication_lag.js
```

### Oplog monitor
Shows oplog size, time window and apply rate:
```shell
docker cp monitoring/oplog_monitor.js mongo-primary:/tmp/ && \
docker exec mongo-primary mongosh /tmp/oplog_monitor.js
```

### Consistency check
Compares `dbHash` checksums across all replica set members:
```shell
./monitoring/check_checksums.sh
```

### rs.status() before/during/after failure
Injects a failure and prints replica set status at each stage:
```shell
./monitoring/rs_status_watch.sh stop_secondary
# or: disconnect_secondary, stop_primary
```

### Lag tracker
Polls replication lag every N seconds and logs to `monitoring/lag.log`:
```shell
python3 monitoring/lag_tracker.py 5
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
