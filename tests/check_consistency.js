const users = db.users.countDocuments();
const movies = db.movies.countDocuments();
const ratings = db.ratings.countDocuments();

print(`Users: ${users}`);
print(`Movies: ${movies}`);
print(`Ratings: ${ratings}`);