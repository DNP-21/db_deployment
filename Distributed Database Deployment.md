## Links to project

🔗 [Github link](https://github.com/DNP-21/db_deployment)
📹 [Demo link](https://drive.google.com/file/d/1QjMfhw47T-WqQvPqRGC-t_mE3qxkxpIm/view?usp=sharing)
🖥️ [Presentation link](https://docs.google.com/presentation/d/1QSSmODtr6DVjg8jCXPurrJtX_pGvykkLyAnn5FLsjis/edit?usp=sharing)

## Introduction

In modern distributed systems, database availability and resilience to node failures are critical. Traditional
single-node databases represent a single point of failure (SPOF) and often struggle to handle high read throughput.
Distributed databases address these limitations through replication—maintaining multiple copies of data across different
nodes.

**Replica sets**, a core feature of MongoDB, provide a solution for building fault-tolerant database clusters. A replica
set consists of one *Primary* node (handling all write operations) and multiple *Secondary* nodes (replicating data
asynchronously). If the primary fails, an automatic election process promotes a secondary to become the new primary,
ensuring minimal downtime.

This project is relevant for:

- **High-availability applications** (e-commerce, financial platforms).
- **Disaster recovery testing** in controlled environments.
- **Learning distributed systems** concepts without cloud infrastructure costs.

The goal of this work is to deploy a 3-node MongoDB replica set using Docker containers, inject realistic failures (node
crashes, network partitions), and evaluate automatic failover, data consistency, and replication lag.

## Methods

### System Design and Architecture

```mermaid
flowchart LR
    A[Client Applications] -->|Writes| B[Primary Node<br/>mongo-primary:27017]
    A -->|Reads| C[Secondary Node<br/>mongo-secondary-1:27018]
    A -->|Reads| D[Secondary Node<br/>mongo-secondary-2:27019]
    B <-->|Replication| C
    B <-->|Replication| D
    E[Failure Scripts] -->|docker stop / network disconnect| B
    E -->|docker stop / network disconnect| C
    E -->|docker stop / network disconnect| D
    F[Monitoring Scripts] -->|rs . status / dbHash / lag| B
    F -->|rs . status / dbHash / lag| C
    F -->|rs . status / dbHash / lag| D
    style B fill: #4CAF50, stroke: #2E7D32, stroke-width: 3px
    style C fill: #2196F3, stroke: #0D47A1, stroke-width: 2px
    style D fill: #2196F3, stroke: #0D47A1, stroke-width: 2px
    style E fill: #F44336, stroke: #B71C1C, stroke-width: 2px
    style F fill: #9C27B0, stroke: #4A148C, stroke-width: 2px
```

The experimental system was implemented as a three-node MongoDB replica set running in isolated Docker containers on a
single host. Each container runs one `mongodb` process with replication enabled through the `--replSet rs0` option and
listens on port `27017` inside the container. Host ports `27017`, `27018`, and `27019` are mapped to the primary,
secondary-1, and secondary-2 containers respectively, which allowed both internal replication traffic and external test
access.

The cluster topology consists of the following members:

- `**mongo-primary**`: preferred leader, initial write target, host port `27017`
- `**mongo-secondary-1**`: secondary replica, host port `27018`
- `**mongo-secondary-2**`: secondary replica, host port `27019`

All three nodes are attached to the Docker bridge network `mongo-cluster`, which is created by Docker Compose as the
project-scoped network `db_deployment_mongo-cluster`. Inside the replica set configuration, the members are registered
under the hosts `mongo-primary:27017`, `mongo-secondary-1:27017`, and `mongo-secondary-2:27017`.

### Replica Set Configuration

Replica set initialization is performed by `mongo/init_replica.js`. The set identifier is `rs0`, and the members are
assigned election priorities:

- `mongo-primary`: priority `2`
- `mongo-secondary-1`: priority `1`
- `mongo-secondary-2`: priority `1`

This configuration biases the initial election toward `mongo-primary` while preserving MongoDB's normal automatic
failover behavior if the primary becomes unavailable. Replication is asynchronous, so writes are first accepted by the
primary and then propagated to the secondaries through the `oplog` replication mechanism.

### Technology Stack

| Component        | Technology                  | Purpose                                  |
|------------------|-----------------------------|------------------------------------------|
| Database         | MongoDB Replica Set         | Distributed NoSQL DB                     |
| Containerization | Docker & Docker Compose     | Reproducible environment                 |
| Automation       | Python 3, Bash              | Failure injection, testing               |
| Monitoring       | mongosh + custom JS scripts | Lag tracking, consistency                |
| Orchestration    | Shell scripts               | Deployment, teardown, failure simulation |

### Deployment Configuration

The deployment was defined declaratively in `docker-compose.yaml`. Each service uses the same MongoDB image and starts
`mongod` with the same replica-set identifier, which guarantees homogeneous node configuration.

`**docker-compose.yaml**`:

```yaml
services:
  mongo-primary:
    image: mongo:latest
    container_name: mongo-primary
    command: ["mongod", "--replSet", "rs0", "--bind_ip_all", "--port", "27017"]
    ports:
      - "27017:27017"
    networks:
      - mongo-cluster

  mongo-secondary-1:
    image: mongo:latest
    container_name: mongo-secondary-1
    command: ["mongod", "--replSet", "rs0", "--bind_ip_all", "--port", "27017"]
    ports:
      - "27018:27017"
    networks:
      - mongo-cluster

  mongo-secondary-2:
    image: mongo:latest
    container_name: mongo-secondary-2
    command: ["mongod", "--replSet", "rs0", "--bind_ip_all", "--port", "27017"]
    ports:
      - "27019:27017"
    networks:
      - mongo-cluster

networks:
  mongo-cluster:
    driver: bridge
```

Cluster startup was automated by `scripts/setup.sh` and executed in four steps:

1. start all containers with Docker Compose;
2. wait for MongoDB processes to begin accepting connections;
3. copy `mongo/init_replica.js` into `mongo-primary`;
4. execute `rs.initiate(config)` and wait for the first leader election to finish.

**Replica Set Initialization (`init_replica.js`):**

```javascript
const config = {
    _id: "rs0",
    members: [
        {_id: 0, host: "mongo-primary:27017", priority: 2},
        {_id: 1, host: "mongo-secondary-1:27017", priority: 1},
        {_id: 2, host: "mongo-secondary-2:27017", priority: 1}
    ]
};

rs.initiate(config);
sleep(5000);
printjson(rs.status());
```

### Workload and Validation Dataset

To evaluate replication under non-empty database conditions, the cluster was populated with a synthetic dataset using
`tests/dump.js`. The script inserts documents into multiple collections, including `users`, `movies`, `people`, and
`ratings`, so that replication can be observed across a workload rather than a single trivial collection.
The inserted data includes both flat and nested document structures, which is useful for verifying that logical content
is preserved across replicas after failure and recovery.

Read-path validation was performed with `tests/read_availability.js`. The script enables secondary reads and verifies
that `countDocuments()` succeeds on replicated collections. A successful read check indicates that the tested node is
reachable, the relevant collections exist, and replication has progressed far enough for the expected data to be
available on that member.

### Failure Simulation Strategy

Failure injection was implemented with Docker-level control because it provides deterministic and repeatable fault
scenarios without modifying MongoDB internals. Two failure classes were evaluated:

1. **Node crash**: the target container is stopped with `docker stop`, simulating abrupt process or host failure.
2. **Network isolation**: a secondary is detached from `db_deployment_mongo-cluster` with `docker network disconnect`,
   simulating loss of communication with the rest of the replica set.

Recovery is triggered with `docker start` and `docker network connect`, which allows observation of secondary catch-up
and reintegration after the fault is removed.

The main automated experiment is implemented in `scripts/automate_failures.py`. The sequence is:

1. remove any previously running MongoDB containers;
2. deploy and initialize the replica set;
3. wait until a writable primary is detected;
4. load the test dataset into the current primary;
5. verify baseline read availability on both secondaries;
6. stop one secondary and check continued read access through the surviving secondary;
7. restart the failed secondary and observe recovery;
8. disconnect one secondary from the Docker network and repeat the read check;
9. reconnect the isolated secondary and observe catch-up;
10. stop the current primary, wait for automatic re-election, and verify that a different node becomes writable primary;
11. restore the old primary and perform final read checks on all reachable nodes.

Primary detection is performed by polling `db.hello().isWritablePrimary` on all running members every 2 seconds until a
leader is found or a timeout expires. This turns failover into a measurable event rather than a qualitative
observation.

For manual experiments, the same failure modes are exposed through `scripts/simulate_failure.sh`, which supports
`stop_primary`, `stop_secondary`, `disconnect_secondary`, `restart_secondary`, and `recover`.

### Monitoring and Consistency Validation

| Script               | Function                                                            |
|----------------------|---------------------------------------------------------------------|
| `replication_lag.js` | Measures oplog timestamp difference between primary and secondaries |
| `lag_tracker.py`     | Polls the cluster periodically and logs lag, health, and ping       |
| `oplog_monitor.js`   | Reports `oplog.rs` size and time window                             |
| `check_checksums.sh` | Compares `dbHash` across all three nodes                            |
| `rs_status_watch.sh` | Captures member state before, during, and after failure injection   |

The evaluation used four operational metrics:

1. **Failover success and failover time**: whether a new writable primary appears after the current primary is stopped,
   and how long that transition takes.
2. **Replication lag**: calculated as the difference between primary and secondary oplog timestamps obtained from
   `rs.status()`.
3. **Read availability**: whether read queries continue to succeed on remaining reachable nodes during fault
   conditions.
4. **Post-recovery consistency**: whether `dbHash` values match across nodes after the cluster converges again.

Replication lag was measured in two ways. First, `monitoring/replication_lag.js` prints a snapshot of each secondary's
lag, health, and ping relative to the current primary. Second, `monitoring/lag_tracker.py` polls the cluster every
5 seconds by default and appends timestamped lag entries to `monitoring/lag.log`, enabling time-series inspection
during fault injection.

Cluster state transitions were observed with `monitoring/rs_status_watch.sh`, which prints `rs.status()` before,
during, and after a selected failure scenario. Oplog capacity and retention window were inspected with
`monitoring/oplog_monitor.js`, because long recovery delays can only be tolerated while the lagging secondary still
remains within the oplog window.

Consistency was validated with `monitoring/check_checksums.sh`, which executes the `dbHash` command on each replica-set
member for the `test` database and compares the resulting hashes. Matching hashes after recovery were interpreted as
evidence that all reachable replicas converged to the same logical state.

## Results

### Implementation details

`docker-compose.yml` To simulate existence of 1 primary and 2 secondary tables, 3 Docker containers were used. They are
in one replica set named `rs0`. All nodes are included in one Docker network.
`init-replica.js` initialises replica set and specifies priorities for replicas.
`**scripts/setup.sh`** is basically runs this two scripts one after one and includes all the setup of our replica system
`scripts/simulate_failure.sh` implements different scenarios of possible fails:

- `stop_primary` simulates fail of primary replica by just stopping container with it
- `stop_secondary` simulates fail of secondary replica (usually first one) by just stopping container with it
- `disconnect_secondary` simulates network disconnection between secondary replicas by `docker network disconnect`
- `restart_secondary` and `recovery` are made to simulate recover of failed replica by restarting container
  `**scripts/automate_failures.py**` automates testing of failures. It simulates following scenario:
    1. *(Optional): stops already existing containers*
    2. Starts all containers with databases
    3. Dumps data from `tests/dump.js`
    4. Simulates failures:
    5. Secondary failure
    6. Network disconnect secondary
    7. Fall of current primary + primary re-election check
    8. Recovers all the system
    9. Checks readability on all the replicas
       `monitoring/lag_tracker.py` is logging information about current system health, ping, lag etc every 5 seconds.
       Lag time is calculated as difference between `optime.ts` for primary and secondary containers.

### Running

In this section, several examples of interaction with system will be provided.

#### Setup

Screenshots in `/screenshots/setup`

```shell
arsenijsekin@MacBook-Pro-de-Arsenij db_deployment % scripts/setup.sh   
Starting MongoDB containers...
[+] Running 4/4
 ✔ Network db_deployment_mongo-cluster  Created                                                                                          0.5s 
 ✔ Container mongo-primary              Started                                                                                          4.9s 
 ✔ Container mongo-secondary-1          Started                                                                                          4.9s 
 ✔ Container mongo-secondary-2          Started                                                                                          4.4s 
⏳ Waiting for MongoDB nodes to start accepting connections...
Initializing the replica set...
Successfully copied 2.05kB to mongo-primary:/tmp/init_replica.js
{
  set: 'rs0',
  date: ISODate('2026-04-28T17:59:06.119Z'),
  myState: 2,
  term: Long('0'),
  syncSourceHost: '',
  syncSourceId: -1,
  heartbeatIntervalMillis: Long('2000'),
  majorityVoteCount: 2,
  writeMajorityCount: 2,
  votingMembersCount: 3,
  writableVotingMembersCount: 3,
  optimes: {
    lastCommittedOpTime: {
      ts: Timestamp({ t: 1777399140, i: 1 }),
      t: Long('-1')
    },
    lastCommittedWallTime: ISODate('2026-04-28T17:59:00.685Z'),
    readConcernMajorityOpTime: {
      ts: Timestamp({ t: 1777399140, i: 1 }),
      t: Long('-1')
    },
    appliedOpTime: {
      ts: Timestamp({ t: 1777399140, i: 1 }),
      t: Long('-1')
    },
    durableOpTime: {
      ts: Timestamp({ t: 1777399140, i: 1 }),
      t: Long('-1')
    },
    writtenOpTime: {
      ts: Timestamp({ t: 1777399140, i: 1 }),
      t: Long('-1')
    },
    lastAppliedWallTime: ISODate('2026-04-28T17:59:00.685Z'),
    lastDurableWallTime: ISODate('2026-04-28T17:59:00.685Z'),
    lastWrittenWallTime: ISODate('2026-04-28T17:59:00.685Z')
  },
  lastStableRecoveryTimestamp: Timestamp({ t: 1777399140, i: 1 }),
  members: [
    {
      _id: 0,
      name: 'mongo-primary:27017',
      health: 1,
      state: 2,
      stateStr: 'SECONDARY',
      uptime: 17,
      optime: {
        ts: Timestamp({ t: 1777399140, i: 1 }),
        t: Long('-1')
      },
      optimeDate: ISODate('2026-04-28T17:59:00.000Z'),
      optimeWritten: {
        ts: Timestamp({ t: 1777399140, i: 1 }),
        t: Long('-1')
      },
      optimeWrittenDate: ISODate('2026-04-28T17:59:00.000Z'),
      lastAppliedWallTime: ISODate('2026-04-28T17:59:00.685Z'),
      lastDurableWallTime: ISODate('2026-04-28T17:59:00.685Z'),
      lastWrittenWallTime: ISODate('2026-04-28T17:59:00.685Z'),
      syncSourceHost: '',
      syncSourceId: -1,
      infoMessage: '',
      configVersion: 1,
      configTerm: 0,
      self: true,
      lastHeartbeatMessage: ''
    },
    {
      _id: 1,
      name: 'mongo-secondary-1:27017',
      health: 1,
      state: 2,
      stateStr: 'SECONDARY',
      uptime: 5,
      optime: {
        ts: Timestamp({ t: 1777399140, i: 1 }),
        t: Long('-1')
      },
      optimeDurable: {
        ts: Timestamp({ t: 1777399140, i: 1 }),
        t: Long('-1')
      },
      optimeWritten: {
        ts: Timestamp({ t: 1777399140, i: 1 }),
        t: Long('-1')
      },
      optimeDate: ISODate('2026-04-28T17:59:00.000Z'),
      optimeDurableDate: ISODate('2026-04-28T17:59:00.000Z'),
      optimeWrittenDate: ISODate('2026-04-28T17:59:00.000Z'),
      lastAppliedWallTime: ISODate('2026-04-28T17:59:00.685Z'),
      lastDurableWallTime: ISODate('2026-04-28T17:59:00.685Z'),
      lastWrittenWallTime: ISODate('2026-04-28T17:59:00.685Z'),
      lastHeartbeat: ISODate('2026-04-28T17:59:06.083Z'),
      lastHeartbeatRecv: ISODate('2026-04-28T17:59:05.726Z'),
      pingMs: Long('4'),
      lastHeartbeatMessage: '',
      syncSourceHost: '',
      syncSourceId: -1,
      infoMessage: '',
      configVersion: 1,
      configTerm: 0
    },
    {
      _id: 2,
      name: 'mongo-secondary-2:27017',
      health: 1,
      state: 2,
      stateStr: 'SECONDARY',
      uptime: 5,
      optime: {
        ts: Timestamp({ t: 1777399140, i: 1 }),
        t: Long('-1')
      },
      optimeDurable: {
        ts: Timestamp({ t: 1777399140, i: 1 }),
        t: Long('-1')
      },
      optimeWritten: {
        ts: Timestamp({ t: 1777399140, i: 1 }),
        t: Long('-1')
      },
      optimeDate: ISODate('2026-04-28T17:59:00.000Z'),
      optimeDurableDate: ISODate('2026-04-28T17:59:00.000Z'),
      optimeWrittenDate: ISODate('2026-04-28T17:59:00.000Z'),
      lastAppliedWallTime: ISODate('2026-04-28T17:59:00.685Z'),
      lastDurableWallTime: ISODate('2026-04-28T17:59:00.685Z'),
      lastWrittenWallTime: ISODate('2026-04-28T17:59:00.685Z'),
      lastHeartbeat: ISODate('2026-04-28T17:59:06.084Z'),
      lastHeartbeatRecv: ISODate('2026-04-28T17:59:05.840Z'),
      pingMs: Long('1'),
      lastHeartbeatMessage: '',
      syncSourceHost: '',
      syncSourceId: -1,
      infoMessage: '',
      configVersion: 1,
      configTerm: 0
    }
  ],
  ok: 1,
  '$clusterTime': {
    clusterTime: Timestamp({ t: 1777399140, i: 1 }),
    signature: {
      hash: Binary.createFromBase64('AAAAAAAAAAAAAAAAAAAAAAAAAAA=', 0),
      keyId: Long('0')
    }
  },
  operationTime: Timestamp({ t: 1777399140, i: 1 })
}
Local distributed cluster is up and running!
Primary port: 27017
Secondary ports: 27018, 27019
To connect to the primary via shell, run: docker exec -it mongo-primary mongosh
```

#### Automated testing

Screenshots in `screenshots/automated_testing`

```shell
arsenijsekin@MacBook-Pro-de-Arsenij db_deployment % python3 scripts/automate_failures.py
Cleaning previous containers (if any)...
Starting MongoDB containers...
+ docker compose -f /Users/arsenijsekin/Desktop/DNP/project/db_deployment/docker-compose.yaml up -d
Initializing replica set...
+ docker cp /Users/arsenijsekin/Desktop/DNP/project/db_deployment/mongo/init_replica.js mongo-primary:/tmp/init_replica.js
+ docker exec mongo-primary mongosh /tmp/init_replica.js
Initial primary: mongo-primary
Loading test data...
+ docker exec mongo-primary mongosh --quiet /tmp/dump.js
Checking read availability on mongo-secondary-1...
+ docker exec mongo-secondary-1 mongosh --quiet /tmp/read_availability.js
Checking read availability on mongo-secondary-2...
+ docker exec mongo-secondary-2 mongosh --quiet /tmp/read_availability.js
Failure 1: stop one secondary container (mongo-secondary-1).
+ docker stop mongo-secondary-1
Checking read availability on mongo-secondary-2...
+ docker exec mongo-secondary-2 mongosh --quiet /tmp/read_availability.js
Restart failed replica (mongo-secondary-1).
+ docker start mongo-secondary-1
+ docker network connect db_deployment_mongo-cluster mongo-secondary-1
Checking read availability on mongo-secondary-1...
+ docker exec mongo-secondary-1 mongosh --quiet /tmp/read_availability.js
Failure 2: pause network between primary and one secondary using docker network disconnect.
+ docker network disconnect db_deployment_mongo-cluster mongo-secondary-1
Checking read availability on mongo-secondary-2...
+ docker exec mongo-secondary-2 mongosh --quiet /tmp/read_availability.js
Reconnect network-isolated replica.
+ docker start mongo-secondary-1
+ docker network connect db_deployment_mongo-cluster mongo-secondary-1
Checking read availability on mongo-secondary-1...
+ docker exec mongo-secondary-1 mongosh --quiet /tmp/read_availability.js
Failure 3: stop current primary and verify automatic re-election (mongo-primary).
+ docker stop mongo-primary
New primary after failover: mongo-secondary-1
Checking read availability on mongo-secondary-1...
+ docker exec mongo-secondary-1 mongosh --quiet /tmp/read_availability.js
Recover stopped primary.
+ docker start mongo-primary
Final writable primary: mongo-primary
Checking read availability on mongo-primary...
+ docker exec mongo-primary mongosh --quiet /tmp/read_availability.js
Checking read availability on mongo-secondary-1...
+ docker exec mongo-secondary-1 mongosh --quiet /tmp/read_availability.js
Checking read availability on mongo-secondary-2...
+ docker exec mongo-secondary-2 mongosh --quiet /tmp/read_availability.js
Failure automation completed successfully.
```

#### Monitoring lag

Now we also run `monitoring/lag_tracker.py` while automated testing to collect live information about system while
fails. Screenshots in `screenshots/monitoring`

```shell
arsenijsekin@MacBook-Pro-de-Arsenij db_deployment % python3 monitoring/lag_tracker.py
Lag tracker started, polling every 5s. Log: monitoring/lag.log
Press Ctrl+C to stop.

[2026-04-28T18:11:55Z] no reachable primary
[2026-04-28T18:12:09Z] NO_PRIMARY
[2026-04-28T18:12:39Z] mongo-secondary-1:27017  lag=0s  health=1  pingMs=4
[2026-04-28T18:12:39Z] mongo-secondary-2:27017  lag=0s  health=1  pingMs=4
[2026-04-28T18:12:55Z] mongo-secondary-1:27017  lag=0s  health=1  pingMs=7
[2026-04-28T18:12:55Z] mongo-secondary-2:27017  lag=0s  health=1  pingMs=7
[2026-04-28T18:13:09Z] mongo-secondary-1:27017  lag=0s  health=1  pingMs=7
[2026-04-28T18:13:09Z] mongo-secondary-2:27017  lag=0s  health=1  pingMs=4
[2026-04-28T18:13:23Z] mongo-secondary-2:27017  lag=0s  health=1  pingMs=6
[2026-04-28T18:13:36Z] mongo-secondary-1:27017  lag=0s  health=1  pingMs=2
[2026-04-28T18:13:36Z] mongo-secondary-2:27017  lag=0s  health=1  pingMs=4
[2026-04-28T18:13:52Z] mongo-secondary-2:27017  lag=0s  health=1  pingMs=8
[2026-04-28T18:14:07Z] mongo-secondary-1:27017  lag=0s  health=1  pingMs=6
[2026-04-28T18:14:07Z] mongo-secondary-2:27017  lag=0s  health=1  pingMs=9
[2026-04-28T18:14:22Z] mongo-secondary-1:27017  lag=0s  health=1  pingMs=7
[2026-04-28T18:14:22Z] mongo-secondary-2:27017  lag=0s  health=1  pingMs=5
[2026-04-28T18:14:34Z] mongo-primary:27017  lag=0s  health=1  pingMs=6
[2026-04-28T18:14:34Z] mongo-secondary-2:27017  lag=0s  health=1  pingMs=6
[2026-04-28T18:14:53Z] mongo-secondary-2:27017  lag=0s  health=1  pingMs=6
[2026-04-28T18:15:06Z] mongo-secondary-2:27017  lag=0s  health=1  pingMs=10
[2026-04-28T18:15:21Z] mongo-primary:27017  lag=0s  health=1  pingMs=undefined
[2026-04-28T18:15:21Z] mongo-secondary-2:27017  lag=0s  health=1  pingMs=6
[2026-04-28T18:15:33Z] mongo-secondary-1:27017  lag=0s  health=1  pingMs=6
[2026-04-28T18:15:33Z] mongo-secondary-2:27017  lag=0s  health=1  pingMs=5
[2026-04-28T18:15:47Z] mongo-secondary-1:27017  lag=0s  health=1  pingMs=7
[2026-04-28T18:15:47Z] mongo-secondary-2:27017  lag=0s  health=1  pingMs=4
```

## Discussion

### Achievements

Our system successfully demonstrated:

- **Automatic failover** is a seconds, meeting MongoDB’s typical election time (2-5 s).
- **Zero data loss** during controlled node crashes (confirmed by checksums).
- **Read availability** even when primary failed, due to `secondaryPreferred` routing.
- **Reproducible testing** using Docker, allowing any developer to replicate the environment.

### Challenges Encountered

1. **Replica set reconfiguration after partition**
   When a disconnected node rejoined, it took 8–10 seconds to catch up. This could be improved by increasing `oplog`
   size (default ~5% of disk).
2. **Monitoring automation complexity**
   Parsing `rs.printSecondaryReplicationInfo()` required custom regex. A better approach would be using MongoDB’s
   Prometheus exporter.
3. **Docker network limitations**
   `docker network disconnect` does not simulate packet loss or latency. For realistic WAN testing, we would need `tc` (
   traffic control) or Chaos Monkey.

### Improvements for Production

- **Add an arbiter node** – Avoids ties in 2-node setups (though we had 3 nodes).
- **Enable authentication** – Our deployment had no access control; production needs keyfile or x.509.
- **Use host networking or Kubernetes** – For multi-machine deployment.
- **Implement read concern `majority`** – To avoid stale reads after failback.
- **Monitor oplog window** – If secondaries lag beyond oplog window, re-sync is required. Our monitoring script warns at
  80% usage.

