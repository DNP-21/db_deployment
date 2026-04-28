## Links to project
🔗 [Github link](https://github.com/DNP-21/db_deployment)
📹 [Demo link](https://drive.google.com/file/d/1QjMfhw47T-WqQvPqRGC-t_mE3qxkxpIm/view?usp=sharing)
🖥️ [Presentation link](https://docs.google.com/presentation/d/1QSSmODtr6DVjg8jCXPurrJtX_pGvykkLyAnn5FLsjis/edit?usp=sharing)
## Introduction

In modern distributed systems, database availability and resilience to node failures are critical. Traditional single-node databases represent a single point of failure (SPOF) and often struggle to handle high read throughput. Distributed databases address these limitations through replication—maintaining multiple copies of data across different nodes.

**Replica sets**, a core feature of MongoDB, provide a solution for building fault-tolerant database clusters. A replica set consists of one _Primary_ node (handling all write operations) and multiple _Secondary_ nodes (replicating data asynchronously). If the primary fails, an automatic election process promotes a secondary to become the new primary, ensuring minimal downtime.

This project is relevant for:

- **High-availability applications** (e-commerce, financial platforms).
- **Disaster recovery testing** in controlled environments.
- **Learning distributed systems** concepts without cloud infrastructure costs.

The goal of this work is to deploy a 3-node MongoDB replica set using Docker containers, inject realistic failures (node crashes, network partitions), and evaluate automatic failover, data consistency, and replication lag.

## Methods

### System Design and Architecture

``` mermaid
flowchart LR
    A[Client Applications] -->|Writes| B[Primary Node<br/>mongo1:27017]
    A -->|Reads| C[Secondary Node<br/>mongo2:27018]
    A -->|Reads| D[Secondary Node<br/>mongo3:27019]
    
    B <-->|Replication| C
    B <-->|Replication| D
    
    E[Failure Scripts] -->|docker stop / network disconnect| B
    E -->|docker stop / network disconnect| C
    E -->|docker stop / network disconnect| D
    
    F[Monitoring Scripts] -->|rs.status / dbHash / lag| B
    F -->|rs.status / dbHash / lag| C
    F -->|rs.status / dbHash / lag| D

    style B fill:#4CAF50,stroke:#2E7D32,stroke-width:3px
    style C fill:#2196F3,stroke:#0D47A1,stroke-width:2px
    style D fill:#2196F3,stroke:#0D47A1,stroke-width:2px
    style E fill:#F44336,stroke:#B71C1C,stroke-width:2px
    style F fill:#9C27B0,stroke:#4A148C,stroke-width:2px
```

The system consists of three MongoDB 6.0 nodes deployed as separate Docker containers:

- **Node 1 (Primary)**: Handles all writes.
- **Node 2 (Secondary)**: Asynchronous replication, serves read requests.
- **Node 3 (Secondary)**: Asynchronous replication, serves read requests.

All nodes are connected via a custom Docker bridge network named `mongo-cluster`. The replica set is named `rs0`.
### Technology Stack

| Component        | Technology                  | Purpose                                  |
| ---------------- | --------------------------- | ---------------------------------------- |
| Database         | MongoDB 6.0 (Replica Set)   | Distributed NoSQL DB                     |
| Containerization | Docker & Docker Compose     | Reproducible environment                 |
| Automation       | Python 3, Bash              | Failure injection, testing               |
| Monitoring       | mongosh + custom JS scripts | Lag tracking, consistency                |
| Orchestration    | Shell scripts               | Deployment, teardown, failure simulation |

### Deployment Configuration

**`docker-compose.yaml`** (shortened, without ports, commands and network):

``` yaml
version: '3.8'
services:
	mongo-primary:
		image: mongo:latest
		container_name: mongo-primary
		...

	mongo-secondary-1:
		image: mongo:latest
		container_name: mongo-secondary-1
		...

	mongo-secondary-2:
		image: mongo:latest
		container_name: mongo-secondary-2
		...

...
```
**Replica Set Initialization (`init_replica.js`):**

```javascript
const config = {
	_id: "rs0",
	members: [
		{ _id: 0, host: "mongo-primary:27017", priority: 2 },
		{ _id: 1, host: "mongo-secondary-1:27017", priority: 1 },
		{ _id: 2, host: "mongo-secondary-2:27017", priority: 1 }
	]
};

rs.initiate(config);
sleep(5000);
printjson(rs.status());
```
### Failure Simulation Strategy

We implemented three types of failures using Docker commands and automation scripts:

1. **Node crash** – `docker stop mongo2` (simulates hardware failure).
2. **Network partition** – `docker network disconnect mongo-cluster mongo3` (simulates network isolation).
3. **Delayed recovery** – `docker start mongo2` after 30s (tests catch-up mechanism).

**Automation scripts:**

- `automate_failures.py` – Python script with timeouts and health checks.
- `simulate_failure.sh` – Bash wrapper for quick manual testing.

### Monitoring and Consistency Validation

|Script|Function|
|---|---|
|`replication_lag.js`|Measures `optimeDate` difference between primary and secondaries|
|`lag_tracker.py`|Logs timestamps and calculates lag in seconds|
|`oplog_monitor.js`|Reports `oplog.rs` size and time window|
|`check_checksums.sh`|Compares `dbHash` across all three nodes|
|`rs_status_watch.sh`|Continuously polls `rs.status()` during failure injection|

We also performed **read availability tests** using Python with `secondaryPreferred` read preference to verify that secondaries serve reads even when primary is down.

## Results

### Successful Deployment

Setup of system was automated in `setup.sh`. 
```shell
user@machine db_deployment % ./setup.sh
Starting MongoDB containers...
WARN[0000] user/db_deployment/docker-compose.yaml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion 
[+] Running 4/4
 ✔ Network db_deployment_mongo-cluster  Created                 0.0s 
 ✔ Container mongo-primary              Started                 0.2s 
 ✔ Container mongo-secondary-2          Started                 0.1s 
 ✔ Container mongo-secondary-1          Started                 0.1s 
⏳ Waiting for MongoDB nodes to start accepting connections...
Initializing the replica set...
Successfully copied 2.05kB to mongo-primary:/tmp/init_replica.js
Local distributed cluster is up and running!
Primary port: 27017
Secondary ports: 27018, 27019
To connect to the primary via shell, run: docker exec -it mongo-primary mongosh
```
### Replication Lag Measurements

Studying logs from `lag_tracker.py` from execution of `rs_status_watch.sh` , we simulated some of the possible failures of containers and discovered several lag events. In particular, failing one of two secondary containers yielded a 10-11 seconds lag, while failing the connection between just the primary and secondary containers resulted in a 10 seconds lag. However, stopping the primary container did not cause lag, but resulted in absence of `ping` from primary up to 5 seconds, until the new primary container has been elected.

### Consistency Validation

`dbHash` output before and after failure injection showed **identical checksums** across all three nodes after recovery, confirming no data divergence.

### Read Availability During Failures

| Scenario                       | Read Available? | Notes                          |
| ------------------------------ | --------------- | ------------------------------ |
| All nodes healthy              | Yes             | Reads from secondaries         |
| Primary down (no writes)       | Yes             | Secondary reads work           |
| Two secondaries down           | Yes             | Primary still serves reads     |
| Network partition on secondary | Yes             | Remaining replicas serve reads |
## Discussion

### Achievements

Our system successfully demonstrated:

- **Automatic failover** under 15 seconds, meeting MongoDB’s typical election time (2-5 s).
- **Zero data loss** during controlled node crashes (confirmed by checksums).
- **Read availability** even when primary failed, due to `secondaryPreferred` routing.
- **Reproducible testing** using Docker, allowing any developer to replicate the environment.

### Challenges Encountered

1. **Replica set reconfiguration after partition**  
    When a disconnected node rejoined, it took 8–10 seconds to catch up. This could be improved by increasing `oplog` size (default ~5% of disk).
2. **Monitoring automation complexity**  
    Parsing `rs.printSecondaryReplicationInfo()` required custom regex. A better approach would be using MongoDB’s Prometheus exporter.
3. **Docker network limitations**  
    `docker network disconnect` does not simulate packet loss or latency. For realistic WAN testing, we would need `tc` (traffic control) or Chaos Monkey.

### Improvements for Production

- **Add an arbiter node** – Avoids ties in 2-node setups (though we had 3 nodes).
- **Enable authentication** – Our deployment had no access control; production needs keyfile or x.509.
- **Use host networking or Kubernetes** – For multi-machine deployment.
- **Implement read concern `majority`** – To avoid stale reads after failback.
- **Monitor oplog window** – If secondaries lag beyond oplog window, re-sync is required. Our monitoring script warns at 80% usage.