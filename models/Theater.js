const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TheaterSchema = new Schema({
    theater_name: String,
    theater_address: String,
    nearby_theaters: Array,
    movies: Array,
    theater_revenue: Number
});

module.exports = mongoose.model("Theater", TheaterSchema);