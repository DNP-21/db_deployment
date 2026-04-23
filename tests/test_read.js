// Count users
db.users.countDocuments();

// Average rating by movie
db.ratings.aggregate([
    {
        $lookup: {
            from: "movies",
            localField: "movieId",
            foreignField: "_id",
            as: "movie"
        }
    },
    {   
        $unwind: "$movie"
    },
    {
        $group: {
            _id: "$movie.title",
            avgRating: { $avg: "$rating" },
            count: { $sum: 1 }
        }
    },
    {
        $limit: 5
    }
])