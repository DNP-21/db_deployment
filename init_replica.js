// init_replica.js
const config = {
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo-primary:27017", priority: 2 },
    { _id: 1, host: "mongo-secondary-1:27017", priority: 1 },
    { _id: 2, host: "mongo-secondary-2:27017", priority: 1 }
  ]
};

// Initialize the replica set
rs.initiate(config);

// Wait for the election to finish
sleep(5000);

// Print the status to confirm
printjson(rs.status());
