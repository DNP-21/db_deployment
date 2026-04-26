// Run on primary node:
// docker cp monitoring/oplog_monitor.js mongo-primary:/tmp/ && docker exec mongo-primary mongosh /tmp/oplog_monitor.js

print("Oplog Monitor");
print("Time: " + new Date().toISOString() + "\n\n");

const localDb = db.getSiblingDB("local");
const oplog = localDb.getCollection("oplog.rs");

// get oplog collection stats to check size and max capacity
const stats = localDb.runCommand({ collStats: "oplog.rs" });
const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
const maxSizeMB = (stats.maxSize / 1024 / 1024).toFixed(2);
const usedPct = ((stats.size / stats.maxSize) * 100).toFixed(1);

print("Oplog size:   " + sizeMB + " MB / " + maxSizeMB + " MB (" + usedPct + "% used)");

// find oldest and newest entries to calculate the time window
const first = oplog.find().sort({ $natural: 1 }).limit(1).next();
const last  = oplog.find().sort({ $natural: -1 }).limit(1).next();

if (!first || !last) {
    print("Oplog is empty");
} else {
    const windowSec   = last.ts.t - first.ts.t;
    const windowHours = (windowSec / 3600).toFixed(2);
    const totalOps    = oplog.countDocuments();
    // average number of operations written per second
    const opsPerSec   = windowSec > 0 ? (totalOps / windowSec).toFixed(2) : "N/A";

    print("Oplog window: " + windowHours + " hours (" + windowSec + " seconds)");
    print("Total ops:    " + totalOps);
    print("Apply rate:   ~" + opsPerSec + " ops/sec");
}
