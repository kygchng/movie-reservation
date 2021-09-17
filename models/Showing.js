const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ShowingSchema = new Schema({
    movie_id: String,
    date: String, //“MM/DD/YYY”
    time: String, //“00:00” military time
    showing_tags: Array //Strings - Dolby Atmos, ICON-X, Reserved seating, Closed caption, etc.
});

module.exports = mongoose.model("Showing", ShowingSchema);