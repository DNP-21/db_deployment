// =========================
// MongoDB DUMP
// =========================

// Clear existing collections
db.users.deleteMany({});
db.movies.deleteMany({});
db.people.deleteMany({});
db.ratings.deleteMany({});

// =========================
// USERS COLLECTION
// =========================
db.users.insertMany([
  { email: "user1@example.com", name: "User 1", country: "Country 1", createdAt: new Date() },
  { emaidelel: "user2@example.com", name: "User 2", country: "Country 2", createdAt: new Date() },
  { email: "user3@example.com", name: "User 3", country: "Country 3", createdAt: new Date() },
  { email: "user4@example.com", name: "User 4", country: "Country 4", createdAt: new Date() },
  { email: "user5@example.com", name: "User 5", country: "Country 0", createdAt: new Date() },
  { email: "user6@example.com", name: "User 6", country: "Country 1", createdAt: new Date() },
  { email: "user7@example.com", name: "User 7", country: "Country 2", createdAt: new Date() },
  { email: "user8@example.com", name: "User 8", country: "Country 3", createdAt: new Date() },
  { email: "user9@example.com", name: "User 9", country: "Country 4", createdAt: new Date() },
  { email: "user10@example.com", name: "User 10", country: "Country 0", createdAt: new Date() },
  { email: "user11@example.com", name: "User 11", country: "Country 1", createdAt: new Date() },
  { email: "user12@example.com", name: "User 12", country: "Country 2", createdAt: new Date() },
  { email: "user13@example.com", name: "User 13", country: "Country 3", createdAt: new Date() },
  { email: "user14@example.com", name: "User 14", country: "Country 4", createdAt: new Date() },
  { email: "user15@example.com", name: "User 15", country: "Country 0", createdAt: new Date() },
  { email: "user16@example.com", name: "User 16", country: "Country 1", createdAt: new Date() },
  { email: "user17@example.com", name: "User 17", country: "Country 2", createdAt: new Date() },
  { email: "user18@example.com", name: "User 18", country: "Country 3", createdAt: new Date() },
  { email: "user19@example.com", name: "User 19", country: "Country 4", createdAt: new Date() },
  { email: "user20@example.com", name: "User 20", country: "Country 0", createdAt: new Date() },
  { email: "user21@example.com", name: "User 21", country: "Country 1", createdAt: new Date() },
  { email: "user22@example.com", name: "User 22", country: "Country 2", createdAt: new Date() },
  { email: "user23@example.com", name: "User 23", country: "Country 3", createdAt: new Date() },
  { email: "user24@example.com", name: "User 24", country: "Country 4", createdAt: new Date() },
  { email: "user25@example.com", name: "User 25", country: "Country 0", createdAt: new Date() },
  { email: "user26@example.com", name: "User 26", country: "Country 1", createdAt: new Date() },
  { email: "user27@example.com", name: "User 27", country: "Country 2", createdAt: new Date() },
  { email: "user28@example.com", name: "User 28", country: "Country 3", createdAt: new Date() },
  { email: "user29@example.com", name: "User 29", country: "Country 4", createdAt: new Date() },
  { email: "user30@example.com", name: "User 30", country: "Country 0", createdAt: new Date() },
  { email: "user31@example.com", name: "User 31", country: "Country 1", createdAt: new Date() },
  { email: "user32@example.com", name: "User 32", country: "Country 2", createdAt: new Date() },
  { email: "user33@example.com", name: "User 33", country: "Country 3", createdAt: new Date() },
  { email: "user34@example.com", name: "User 34", country: "Country 4", createdAt: new Date() },
  { email: "user35@example.com", name: "User 35", country: "Country 0", createdAt: new Date() },
  { email: "user36@example.com", name: "User 36", country: "Country 1", createdAt: new Date() },
  { email: "user37@example.com", name: "User 37", country: "Country 2", createdAt: new Date() },
  { email: "user38@example.com", name: "User 38", country: "Country 3", createdAt: new Date() },
  { email: "user39@example.com", name: "User 39", country: "Country 4", createdAt: new Date() },
  { email: "user40@example.com", name: "User 40", country: "Country 0", createdAt: new Date() },
  { email: "user41@example.com", name: "User 41", country: "Country 1", createdAt: new Date() },
  { email: "user42@example.com", name: "User 42", country: "Country 2", createdAt: new Date() },
  { email: "user43@example.com", name: "User 43", country: "Country 3", createdAt: new Date() },
  { email: "user44@example.com", name: "User 44", country: "Country 4", createdAt: new Date() },
  { email: "user45@example.com", name: "User 45", country: "Country 0", createdAt: new Date() },
  { email: "user46@example.com", name: "User 46", country: "Country 1", createdAt: new Date() },
  { email: "user47@example.com", name: "User 47", country: "Country 2", createdAt: new Date() },
  { email: "user48@example.com", name: "User 48", country: "Country 3", createdAt: new Date() },
  { email: "user49@example.com", name: "User 49", country: "Country 4", createdAt: new Date() },
  { email: "user50@example.com", name: "User 50", country: "Country 0", createdAt: new Date() }
]);

// =========================
// PEOPLE COLLECTION
// =========================
db.people.insertMany([
  // Directors
  { _id: 1, name: "Christopher Nolan", roleType: "director" },
  { _id: 2, name: "Quentin Tarantino", roleType: "director" },
  { _id: 3, name: "David Fincher", roleType: "director" },
  { _id: 4, name: "James Cameron", roleType: "director" },
  { _id: 5, name: "Ridley Scott", roleType: "director" },
  { _id: 6, name: "Denis Villeneuve", roleType: "director" },
  { _id: 7, name: "Martin Scorsese", roleType: "director" },
  { _id: 8, name: "Bong Joon-ho", roleType: "director" },
  { _id: 9, name: "Todd Phillips", roleType: "director" },
  { _id: 10, name: "Damien Chazelle", roleType: "director" },
  { _id: 11, name: "Wes Anderson", roleType: "director" },
  { _id: 12, name: "Coen Brothers", roleType: "director" },
  // Writers
  { _id: 20, name: "Jonathan Nolan", roleType: "writer" },
  { _id: 21, name: "Aaron Sorkin", roleType: "writer" },
  { _id: 22, name: "Charlie Kaufman", roleType: "writer" },
  { _id: 23, name: "Quentin Tarantino", roleType: "writer" },
  { _id: 24, name: "Christopher Nolan", roleType: "writer" },
  { _id: 25, name: "Bong Joon-ho", roleType: "writer" },
  { _id: 26, name: "Eric Roth", roleType: "writer" },
  { _id: 27, name: "Denis Villeneuve", roleType: "writer" },
  // Composers
  { _id: 40, name: "Hans Zimmer", roleType: "composer" },
  { _id: 41, name: "John Williams", roleType: "composer" },
  { _id: 42, name: "Trent Reznor", roleType: "composer" },
  { _id: 43, name: "Ennio Morricone", roleType: "composer" },
  { _id: 44, name: "Justin Hurwitz", roleType: "composer" },
  { _id: 45, name: "Alexandre Desplat", roleType: "composer" },
  // Actors
  { _id: 60, name: "Leonardo DiCaprio", roleType: "actor" },
  { _id: 61, name: "Joseph Gordon-Levitt", roleType: "actor" },
  { _id: 62, name: "Elliot Page", roleType: "actor" },
  { _id: 63, name: "Tom Hardy", roleType: "actor" },
  { _id: 64, name: "Keanu Reeves", roleType: "actor" },
  { _id: 65, name: "Laurence Fishburne", roleType: "actor" },
  { _id: 66, name: "Carrie-Anne Moss", roleType: "actor" },
  { _id: 67, name: "Matthew McConaughey", roleType: "actor" },
  { _id: 68, name: "Anne Hathaway", roleType: "actor" },
  { _id: 69, name: "Jessica Chastain", roleType: "actor" },
  { _id: 70, name: "Al Pacino", roleType: "actor" },
  { _id: 71, name: "Marlon Brando", roleType: "actor" },
  { _id: 72, name: "Christian Bale", roleType: "actor" },
  { _id: 73, name: "Heath Ledger", roleType: "actor" },
  { _id: 74, name: "John Travolta", roleType: "actor" },
  { _id: 75, name: "Samuel L. Jackson", roleType: "actor" },
  { _id: 76, name: "Brad Pitt", roleType: "actor" },
  { _id: 77, name: "Edward Norton", roleType: "actor" },
  { _id: 78, name: "Tom Hanks", roleType: "actor" },
  { _id: 79, name: "Robin Wright", roleType: "actor" },
  { _id: 80, name: "Morgan Freeman", roleType: "actor" },
  { _id: 81, name: "Tim Robbins", roleType: "actor" },
  { _id: 82, name: "Russell Crowe", roleType: "actor" },
  { _id: 83, name: "Joaquin Phoenix", roleType: "actor" },
  { _id: 84, name: "Kate Winslet", roleType: "actor" },
  { _id: 85, name: "Sam Worthington", roleType: "actor" },
  { _id: 86, name: "Robert Downey Jr.", roleType: "actor" },
  { _id: 87, name: "Chris Evans", roleType: "actor" },
  { _id: 88, name: "Scarlett Johansson", roleType: "actor" },
  { _id: 89, name: "Song Kang-ho", roleType: "actor" },
  { _id: 90, name: "Miles Teller", roleType: "actor" },
  { _id: 91, name: "Ryan Gosling", roleType: "actor" },
  { _id: 92, name: "Emma Stone", roleType: "actor" },
  { _id: 93, name: "Jesse Eisenberg", roleType: "actor" },
  { _id: 94, name: "Timothée Chalamet", roleType: "actor" },
  { _id: 95, name: "Harrison Ford", roleType: "actor" },
  { _id: 96, name: "Ryan Reynolds", roleType: "actor" },
  { _id: 97, name: "Margot Robbie", roleType: "actor" },
  { _id: 98, name: "Tom Holland", roleType: "actor" },
  { _id: 99, name: "Zendaya", roleType: "actor" }
]);

// =========================
// MOVIES COLLECTION
// =========================
db.movies.insertMany([
  {
    _id: 1,
    title: "Inception",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 1, name: "Christopher Nolan", role: "director" },
      { personId: 24, name: "Christopher Nolan", role: "writer" },
      { personId: 40, name: "Hans Zimmer", role: "composer" },
      { personId: 60, name: "Leonardo DiCaprio", role: "actor" },
      { personId: 61, name: "Joseph Gordon-Levitt", role: "actor" },
      { personId: 62, name: "Elliot Page", role: "actor" },
      { personId: 63, name: "Tom Hardy", role: "actor" }
    ]
  },
  {
    _id: 2,
    title: "Matrix",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 3, name: "David Fincher", role: "director" },
      { personId: 22, name: "Charlie Kaufman", role: "writer" },
      { personId: 42, name: "Trent Reznor", role: "composer" },
      { personId: 64, name: "Keanu Reeves", role: "actor" },
      { personId: 65, name: "Laurence Fishburne", role: "actor" },
      { personId: 66, name: "Carrie-Anne Moss", role: "actor" }
    ]
  },
  {
    _id: 3,
    title: "Interstellar",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 1, name: "Christopher Nolan", role: "director" },
      { personId: 20, name: "Jonathan Nolan", role: "writer" },
      { personId: 40, name: "Hans Zimmer", role: "composer" },
      { personId: 67, name: "Matthew McConaughey", role: "actor" },
      { personId: 68, name: "Anne Hathaway", role: "actor" },
      { personId: 69, name: "Jessica Chastain", role: "actor" }
    ]
  },
  {
    _id: 4,
    title: "Godfather",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 7, name: "Martin Scorsese", role: "director" },
      { personId: 26, name: "Eric Roth", role: "writer" },
      { personId: 43, name: "Ennio Morricone", role: "composer" },
      { personId: 70, name: "Al Pacino", role: "actor" },
      { personId: 71, name: "Marlon Brando", role: "actor" }
    ]
  },
  {
    _id: 5,
    title: "Dark Knight",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 1, name: "Christopher Nolan", role: "director" },
      { personId: 24, name: "Christopher Nolan", role: "writer" },
      { personId: 40, name: "Hans Zimmer", role: "composer" },
      { personId: 72, name: "Christian Bale", role: "actor" },
      { personId: 73, name: "Heath Ledger", role: "actor" }
    ]
  },
  {
    _id: 6,
    title: "Pulp Fiction",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 2, name: "Quentin Tarantino", role: "director" },
      { personId: 23, name: "Quentin Tarantino", role: "writer" },
      { personId: 43, name: "Ennio Morricone", role: "composer" },
      { personId: 74, name: "John Travolta", role: "actor" },
      { personId: 75, name: "Samuel L. Jackson", role: "actor" }
    ]
  },
  {
    _id: 7,
    title: "Fight Club",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 3, name: "David Fincher", role: "director" },
      { personId: 21, name: "Aaron Sorkin", role: "writer" },
      { personId: 42, name: "Trent Reznor", role: "composer" },
      { personId: 76, name: "Brad Pitt", role: "actor" },
      { personId: 77, name: "Edward Norton", role: "actor" }
    ]
  },
  {
    _id: 8,
    title: "Forrest Gump",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 7, name: "Martin Scorsese", role: "director" },
      { personId: 26, name: "Eric Roth", role: "writer" },
      { personId: 41, name: "John Williams", role: "composer" },
      { personId: 78, name: "Tom Hanks", role: "actor" },
      { personId: 79, name: "Robin Wright", role: "actor" }
    ]
  },
  {
    _id: 9,
    title: "Shawshank",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 7, name: "Martin Scorsese", role: "director" },
      { personId: 26, name: "Eric Roth", role: "writer" },
      { personId: 41, name: "John Williams", role: "composer" },
      { personId: 80, name: "Morgan Freeman", role: "actor" },
      { personId: 81, name: "Tim Robbins", role: "actor" }
    ]
  },
  {
    _id: 10,
    title: "Gladiator",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 5, name: "Ridley Scott", role: "director" },
      { personId: 26, name: "Eric Roth", role: "writer" },
      { personId: 40, name: "Hans Zimmer", role: "composer" },
      { personId: 82, name: "Russell Crowe", role: "actor" }
    ]
  },
  {
    _id: 11,
    title: "Titanic",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 4, name: "James Cameron", role: "director" },
      { personId: 26, name: "Eric Roth", role: "writer" },
      { personId: 41, name: "John Williams", role: "composer" },
      { personId: 60, name: "Leonardo DiCaprio", role: "actor" },
      { personId: 84, name: "Kate Winslet", role: "actor" }
    ]
  },
  {
    _id: 12,
    title: "Avatar",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 4, name: "James Cameron", role: "director" },
      { personId: 26, name: "Eric Roth", role: "writer" },
      { personId: 40, name: "Hans Zimmer", role: "composer" },
      { personId: 85, name: "Sam Worthington", role: "actor" }
    ]
  },
  {
    _id: 13,
    title: "Avengers",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 9, name: "Todd Phillips", role: "director" },
      { personId: 21, name: "Aaron Sorkin", role: "writer" },
      { personId: 40, name: "Hans Zimmer", role: "composer" },
      { personId: 86, name: "Robert Downey Jr.", role: "actor" },
      { personId: 87, name: "Chris Evans", role: "actor" },
      { personId: 88, name: "Scarlett Johansson", role: "actor" }
    ]
  },
  {
    _id: 14,
    title: "Joker",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 9, name: "Todd Phillips", role: "director" },
      { personId: 21, name: "Aaron Sorkin", role: "writer" },
      { personId: 40, name: "Hans Zimmer", role: "composer" },
      { personId: 83, name: "Joaquin Phoenix", role: "actor" }
    ]
  },
  {
    _id: 15,
    title: "Parasite",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 8, name: "Bong Joon-ho", role: "director" },
      { personId: 25, name: "Bong Joon-ho", role: "writer" },
      { personId: 45, name: "Alexandre Desplat", role: "composer" },
      { personId: 89, name: "Song Kang-ho", role: "actor" }
    ]
  },
  {
    _id: 16,
    title: "Whiplash",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 10, name: "Damien Chazelle", role: "director" },
      { personId: 22, name: "Charlie Kaufman", role: "writer" },
      { personId: 44, name: "Justin Hurwitz", role: "composer" },
      { personId: 90, name: "Miles Teller", role: "actor" }
    ]
  },
  {
    _id: 17,
    title: "La La Land",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 10, name: "Damien Chazelle", role: "director" },
      { personId: 22, name: "Charlie Kaufman", role: "writer" },
      { personId: 44, name: "Justin Hurwitz", role: "composer" },
      { personId: 91, name: "Ryan Gosling", role: "actor" },
      { personId: 92, name: "Emma Stone", role: "actor" }
    ]
  },
  {
    _id: 18,
    title: "Social Network",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 3, name: "David Fincher", role: "director" },
      { personId: 21, name: "Aaron Sorkin", role: "writer" },
      { personId: 42, name: "Trent Reznor", role: "composer" },
      { personId: 93, name: "Jesse Eisenberg", role: "actor" }
    ]
  },
  {
    _id: 19,
    title: "Dune",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 6, name: "Denis Villeneuve", role: "director" },
      { personId: 27, name: "Denis Villeneuve", role: "writer" },
      { personId: 40, name: "Hans Zimmer", role: "composer" },
      { personId: 94, name: "Timothée Chalamet", role: "actor" },
      { personId: 99, name: "Zendaya", role: "actor" }
    ]
  },
  {
    _id: 20,
    title: "Blade Runner 2049",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 6, name: "Denis Villeneuve", role: "director" },
      { personId: 27, name: "Denis Villeneuve", role: "writer" },
      { personId: 40, name: "Hans Zimmer", role: "composer" },
      { personId: 95, name: "Harrison Ford", role: "actor" },
      { personId: 91, name: "Ryan Gosling", role: "actor" }
    ]
  },
  {
    _id: 21,
    title: "Wolf of Wall Street",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 7, name: "Martin Scorsese", role: "director" },
      { personId: 26, name: "Eric Roth", role: "writer" },
      { personId: 40, name: "Hans Zimmer", role: "composer" },
      { personId: 60, name: "Leonardo DiCaprio", role: "actor" },
      { personId: 97, name: "Margot Robbie", role: "actor" }
    ]
  },
  {
    _id: 22,
    title: "Mad Max",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 5, name: "Ridley Scott", role: "director" },
      { personId: 26, name: "Eric Roth", role: "writer" },
      { personId: 40, name: "Hans Zimmer", role: "composer" },
      { personId: 63, name: "Tom Hardy", role: "actor" }
    ]
  },
  {
    _id: 23,
    title: "Grand Budapest",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 11, name: "Wes Anderson", role: "director" },
      { personId: 22, name: "Charlie Kaufman", role: "writer" },
      { personId: 45, name: "Alexandre Desplat", role: "composer" }
    ]
  },
  {
    _id: 24,
    title: "Her",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 3, name: "David Fincher", role: "director" },
      { personId: 22, name: "Charlie Kaufman", role: "writer" },
      { personId: 45, name: "Alexandre Desplat", role: "composer" },
      { personId: 83, name: "Joaquin Phoenix", role: "actor" }
    ]
  },
  {
    _id: 25,
    title: "No Country",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 12, name: "Coen Brothers", role: "director" },
      { personId: 26, name: "Eric Roth", role: "writer" },
      { personId: 43, name: "Ennio Morricone", role: "composer" }
    ]
  },
  {
    _id: 26,
    title: "Prestige",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 1, name: "Christopher Nolan", role: "director" },
      { personId: 24, name: "Christopher Nolan", role: "writer" },
      { personId: 40, name: "Hans Zimmer", role: "composer" },
      { personId: 72, name: "Christian Bale", role: "actor" }
    ]
  },
  {
    _id: 27,
    title: "Arrival",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 6, name: "Denis Villeneuve", role: "director" },
      { personId: 27, name: "Denis Villeneuve", role: "writer" },
      { personId: 40, name: "Hans Zimmer", role: "composer" }
    ]
  },
  {
    _id: 28,
    title: "Black Swan",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 3, name: "David Fincher", role: "director" },
      { personId: 22, name: "Charlie Kaufman", role: "writer" },
      { personId: 40, name: "Hans Zimmer", role: "composer" }
    ]
  },
  {
    _id: 29,
    title: "Revenant",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 7, name: "Martin Scorsese", role: "director" },
      { personId: 26, name: "Eric Roth", role: "writer" },
      { personId: 40, name: "Hans Zimmer", role: "composer" },
      { personId: 60, name: "Leonardo DiCaprio", role: "actor" }
    ]
  },
  {
    _id: 30,
    title: "Oppenheimer",
    releaseYear: null,
    genre: null,
    durationMinutes: null,
    crew: [
      { personId: 1, name: "Christopher Nolan", role: "director" },
      { personId: 24, name: "Christopher Nolan", role: "writer" },
      { personId: 40, name: "Hans Zimmer", role: "composer" },
      { personId: 72, name: "Christian Bale", role: "actor" }
    ]
  }
]);

// =========================
// RATINGS COLLECTION
// =========================
const ratings = [];
for (let u = 1; u <= 50; u++) {
  for (let i = 0; i < 7; i++) {
    const movieId = Math.floor(Math.random() * 29 + 1);
    const rating = Math.floor(Math.random() * 9 + 1);
    ratings.push({
      userId: u,
      movieId: movieId,
      rating: rating,
      createdAt: new Date()
    });
  }
}
db.ratings.insertMany(ratings);

// =========================
// CREATE INDEXES
// =========================
db.users.createIndex({ email: 1 }, { unique: true });
db.ratings.createIndex({ userId: 1 });
db.ratings.createIndex({ movieId: 1 });
db.ratings.createIndex({ userId: 1, movieId: 1 });

print("MongoDB dump loaded successfully!");
