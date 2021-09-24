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

router.post("/register/movie", async(req, res) => {
    const user = await Movie.findOne({theater_id: req.body.theater_id, movie_name: req.body.movie_name}); //doesn't catch duplicates?
    if(user) {
        //duplicate
        return res.status(400).send({});
    } else {
        const newMovie = new Movie(req.body);
        newMovie.save().catch(err => console.log(err));
        return res.status(200).send(newMovie);
    }
});

router.post("/register/showing", async(req, res) => {
    const user = await Showing.findOne({movie_id: req.body.movie_id, date: req.body.date, time: req.body.time});
    if(user) {
        //duplicate
        return res.status(400).send({});
    } else {
        const newShowing = new Showing(req.body);
        newShowing.save().catch(err => console.log(err));
        return res.status(200).send(newShowing);
    }
});

router.get("/fetch/theaters", async(req, res) => {
    const theaterList = await Theater.find();
    return res.status(200).send(theaterList);
});

router.get("/fetch/movies/:theaterID", async(req, res) => {
    const movieList = await Movie.find({theater_id: req.params.theaterID});
    if(movieList.length!=0) {
        return res.status(200).send(movieList);
    } else {
        return res.status(404).send({});
    }
})

router.get("/fetch/movie/:movieID", async(req, res) => {
    const movie_id = ObjectId(req.params.movieID);
    const movie = await Movie.findById(movie_id);
    if(movie) {
        return res.status(200).send(movie);
    } else {
        //movie doesn't exist
        return res.status(404).send({});
    }
})

router.get("/fetch/available/showings/:movieID", async(req, res) => {
    // .toTimeString() = 19:26:38 GMT-0700 (Pacific Daylight Time)
    var d = new Date();
    var time = d.toTimeString(); 
    const currHour = parseInt(time.substring(0, 2)); //"19"
    const currMinute = parseInt(time.substring(3, 5)); //"26"

    var timesJSON = {};
    var avail = [];
    var unavail = [];

    const showingList = await Showing.find({movie_id: req.params.movieID});
    if(showingList.length!=0) {
        //this movieID exists
        for(var i = 0; i < showingList.length; i++) {
            const showingDoc = showingList[i];
            const showingHour = parseInt(showingDoc.time.substring(0, 2));
            const showingMinute = parseInt(showingDoc.time.substring(3));
            var showingJSON = {
                "time": showingDoc.time.substring(0, 2) + ":" + showingDoc.time.substring(3),
                "showingID": showingDoc._id
            };

            //showing="17:07", curr="13:05"
            if(showingHour >= currHour) {
                if (showingHour == currHour) {
                    if (showingMinute >= currMinute) {
                        avail.push(showingJSON);
                    } else {
                        unavail.push(showingJSON);
                    }
                } else {
                    avail.push(showingJSON);
                }
            } else {
                unavail.push(showingJSON);
            }
        }

        timesJSON["availableShowings"] = avail;
        timesJSON["unavailableShowings"] = unavail;

        return res.status(200).send(timesJSON);
    } else {
        return res.status(404).send({});
    }
});

module.exports = router; //exports