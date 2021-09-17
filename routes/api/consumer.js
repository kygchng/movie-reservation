const express = require("express");
const router = express.Router();

const Theater = require("../../models/Theater");
const Movie = require("../../models/Movie");
const Showing = require("../../models/Showing");
const Seat = require("../../models/Seat");
const Reservation = require("../../models/Reservation");
var ObjectId = require("mongodb").ObjectId;

router.post("/register/theater", async(req, res) => {
    const user = await Theater.findOne({theater_address: req.body.theater_address});
    if(user) {
        //duplicate
        return res.status(400).send({});
    } else {
        const newTheater = new Theater(req.body);
        newTheater.save().catch(err => console.log(err));
        return res.status(200).send(newTheater);
    }
});


module.exports = router; //exports