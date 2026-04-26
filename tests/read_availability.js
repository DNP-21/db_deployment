rs.secondaryOk();

const users = db.getSiblingDB("test").users.countDocuments();
const movies = db.getSiblingDB("test").movies.countDocuments();
const ratings = db.getSiblingDB("test").ratings.countDocuments();

if (users <= 0 || movies <= 0 || ratings <= 0) {
  throw new Error(`Read check failed: users=${users}, movies=${movies}, ratings=${ratings}`);
}

print(`Read availability OK: users=${users}, movies=${movies}, ratings=${ratings}`);
