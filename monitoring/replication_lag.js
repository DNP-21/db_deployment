// Run on primary node:
// docker cp monitoring/replication_lag.js mongo-primary:/tmp/ && docker exec mongo-primary mongosh /tmp/replication_lag.js

print("Replication Lag Report");
print("Time: " + new Date().toISOString() + "\n\n");

// built-in MongoDB helper that prints lag info for each secondary
print("rs.printSecondaryReplicationInfo()");
rs.printSecondaryReplicationInfo();

print("");
print("Custom Metrics (from rs.status())" + "\n\n");

const status = rs.status();
const primary = status.members.find(m => m.stateStr === "PRIMARY");

if (!primary) {
    print("No PRIMARY found in the replica set");
} else {
    print("Primary: " + primary.name + "\n\n");

    const secondaries = status.members.filter(m => m.stateStr === "SECONDARY");

    if (secondaries.length === 0) {
        print("No SECONDARY members found");
    } else {
        secondaries.forEach(sec => {
            // lag = difference between primary and secondary oplog timestamps
            const lagSec = primary.optime.ts.t - sec.optime.ts.t;
            const health = sec.health === 1 ? "UP" : "DOWN";
            print("Secondary: " + sec.name);
            print("  Health:  " + health);
            print("  Lag:     " + lagSec + " second(s)");
            print("  Ping:    " + sec.pingMs + " ms");
            print("");
        });
    }
}
