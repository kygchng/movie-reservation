const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MovieSchema = new Schema({
    theater_id: String,
    movie_name: String,
    movie_description: String,
    movie_length: Number, //minutes
    movie_rating: String,
    movie_tags: Array,
    movie_showings: Array,
    movie_revenue: Number
});

module.exports = mongoose.model("Movie", MovieSchema);