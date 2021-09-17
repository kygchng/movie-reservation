const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReservationSchema = new Schema({
    showing_id: String,
    reserved_seats: Array,
    customer_email: String,
    total_price: Number
});

module.exports = mongoose.model("Reservation", ReservationSchema);