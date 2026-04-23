db.users.insertOne({ 
    email: "macan@yandex.ru", 
    name: "Macan Rapper", 
    country: "Bratland", 
    createdAt: new Date() 
});

db.ratings.insertOne({
    userId: 51,
    movieId: 5,
    rating: 7,
    createdAt: new Date()
});