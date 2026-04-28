# MongoDB Replica Set

This repository contains Docker Compose configuration plus operational
scripts for setting up a local MongoDB replica set, simulating failures,
and tearing the setup down.

Project layout:

- `scripts/` operational entrypoints for setup, teardown, failover simulation, and end-to-end checks
- `mongo/` replica set initialization assets
- `monitoring/` monitoring and diagnostics utilities
- `tests/` Mongo shell scripts used by validation scenarios

### Start and initialize the cluster

Starts containers and initializes the replica set using `mongo/init_replica.js`

```shell
./scripts/setup.sh
```

### Testing & Validation

- Crash the Primary: `./scripts/simulate_failure.sh stop_primary`
- Stop a Secondary: `./scripts/simulate_failure.sh stop_secondary`
- Isolate a Secondary with Docker network disconnect: `./scripts/simulate_failure.sh disconnect_secondary`
- Restart/reconnect a failed Secondary: `./scripts/simulate_failure.sh restart_secondary`
- Restore all nodes: `./scripts/simulate_failure.sh recover`
- Run automated failure injection and failover verification: `./scripts/automate_failures.sh`
- Run the Python version of the same flow: `python3 scripts/automate_failures.py`

### Teardown

Completely stops the cluster and wipes all test data

```shell
./scripts/teardown.sh
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
./scripts/check_primary_failure.sh
```
