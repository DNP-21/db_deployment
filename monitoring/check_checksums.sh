#!/bin/bash
# Compares dbHash checksums across all replica set members.
# Usage: ./monitoring/check_checksums.sh

DB="test"

echo "Consistency Check (dbHash)"
echo "Time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""

ref_hash=""
mismatch=false

for node in mongo-primary mongo-secondary-1 mongo-secondary-2; do
    # run dbHash on each node and extract the overall md5 hash
    h=$(docker exec "$node" mongosh "$DB" --quiet --eval "
        rs.secondaryOk();
        const r = db.runCommand({ dbHash: 1 });
        if (r.ok) { print(r.md5); }
    " 2>/dev/null | grep -v DeprecationWarning | grep -v 'Setting read')

    if [ -n "$h" ]; then
        echo "$node: $h"
        # save the first hash as reference, compare the rest against it
        if [ -z "$ref_hash" ]; then
            ref_hash="$h"
        elif [ "$h" != "$ref_hash" ]; then
            mismatch=true
        fi
    else
        echo "$node: UNREACHABLE"
    fi
done

echo ""
if $mismatch; then
    echo "Result: INCONSISTENCY DETECTED"
else
    echo "Result: All reachable nodes are consistent"
fi
