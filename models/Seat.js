const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SeatSchema = new Schema({
    showing_id: String,
    seat_position: String,
    seat_availbility: Boolean //T = available, F = unavailable
});

module.exports = mongoose.model("Seat", SeatSchema);