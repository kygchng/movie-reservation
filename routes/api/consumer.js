const express = require("express");
const router = express.Router();

const Theater = require("../../models/Theater");
const Movie = require("../../models/Movie");
const Showing = require("../../models/Showing");
const Seat = require("../../models/Seat");
const Reservation = require("../../models/Reservation");
var ObjectId = require("mongodb").ObjectId;
const { findOneAndUpdate } = require("../../models/Theater");

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
                "showingID": showingDoc._id //access the showing's info (time, tags, etc.) when time is displayed
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

router.post("/register/seat", async (req, res) => {
    const seatExists = await Seat.findOne({showing_id: req.body.showing_id, seat_position: req.body.seat_position});
    if(seatExists) {
        //duplicate
        //console.log(seatExists);
        return res.status(400).send({});
    } else {
        const newSeat = new Seat(req.body);
        newSeat.save().catch(err => console.log(err));
        return res.status(200).send(newSeat);
    }
});

router.post("/make/reservation", async (req, res) => {
    const user = await Reservation.findOne({customer_email: req.body.customer_email});
    if(user) {
        //duplicate - assume 1 reservation per email
        return res.status(400).send({});
    } else {
        const newReservation = new Reservation(req.body);
        newReservation.save().catch(err => console.log(err));
    }

    //update movie  revenue
    const showingID = ObjectId(req.body.showing_id);
    const showing = await Showing.findById(showingID);
    const movieID = ObjectId(showing.movie_id);
    const movie = await Movie.findById(movieID);

    const updatedMovieValues = {
        theater_id: movie.theater_id,
        movie_name: movie.movie_name,
        movie_description: movie.movie_description,
        movie_length: movie.movie_length, 
        movie_rating: movie.movie_rating,
        movie_tags: movie.movie_tags,
        movie_showings: movie.movie_showings,
        movie_revenue: movie.movie_revenue + req.body.total_price
    };
    await Movie.findOneAndUpdate({_id: movieID}, updatedMovieValues);

    //update theater revenue
    const theaterID = ObjectId(movie.theater_id);
    const theater = await Theater.findById(theaterID);

    const updatedTheaterValues = {
        theater_name: theater.theater_name,
        theater_address: theater.theater_address,
        nearby_theaters: theater.nearby_theaters,
        movies: theater.movies,
        theater_revenue: theater.theater_revenue + req.body.total_price
    };
    await Theater.findOneAndUpdate({_id: theaterID}, updatedTheaterValues);

    //mark seats as unavailable
    if(newReservation.reserved_seats.length != 0) {
        for(var i = 0; i < newReservation.reserved_seats.length; i++) {
            var seatID = ObjectId(newReservation.reserved_seats[i]);
            var seat = await Seat.findById(seatID);

            var updatedSeatValues = {
                showing_id: seat.showing_id,
                seat_position: seat.seat_position,
                seat_availbility: false
            };
            await Seat.findOneAndUpdate({_id: seatID}, updatedSeatValues);
        }
    } else {
        //no seats reserved
        return res.status(400).send({});
    }

    return res.status(200).send(newReservation);
});

router.put("/update/reservation", async (req, res) => {
    //assume updating reservation = dropping seats

    //get original reservation
    const originalRes = await Reservation.findOne({customer_email: req.body.customer_email});

    //iterate through old reserved seats, check if it has been dropped
    for(var i = 0; i < originalRes.reserved_seats.length; i++) {
        if(! req.body.reserved_seats.includes( originalRes.reserved_seats[i]) ) {
            //this seat has been dropped
            var seatID = ObjectId(originalRes.reserved_seats[i]);
            var seat = await Seat.findById(seatID);

            //make available again
            var updatedSeatValues = {
                showing_id: seat.showing_id,
                seat_position: seat.seat_position,
                seat_availbility: true
            };
            await Seat.findOneAndUpdate({_id: seatID}, updatedSeatValues); 
        }
    }

    //update reservation
    await Reservation.findOneAndUpdate({customer_email: req.body.customer_email}, req.body);
    return res.status(200).send(req.body);
});

router.delete("/delete/reservation/:email", async(req, res) => {
    const reservation = await Reservation.findOne({customer_email: req.params.email});
    if(!reservation) {
        return res.status(400).send({}); //trying to delete a reservation that doesn't exist
    } else {
        //mark seats as available
        for(var i = 0; i < reservation.reserved_seats.length; i++) {
            var seatID = ObjectId(reservation.reserved_seats[i]);
            var seat = await Seat.findById(seatID);

            var updatedSeatValues = {
                showing_id: seat.showing_id,
                seat_position: seat.seat_position,
                seat_availbility: true
            };
            await Seat.findOneAndUpdate({_id: seatID}, updatedSeatValues); 
        }

        //delete res
        const deleteRes = await Reservation.deleteOne({customer_email: req.params.email});
        return res.status(200).send({});
    }
});

router.get("/fetch/movie/revenue/:movieId", async(req, res) => {
    const movieID = ObjectId(req.params.movieId);
    const movie = await Movie.findById(movieID);
    const movieRevenue = {
        revenue: movie.movie_revenue
    };
    if(movie) {
        return res.status(200).send(movieRevenue);
    } else {
        return res.status(404).send({});
    }
});

router.get("/fetch/theater/revenue/:theaterId", async(req, res) => {
    const theaterID = ObjectId(req.params.theaterId);
    const theater = await Theater.findById(theaterID);
    const theaterRevenue = {
        revenue: theater.theater_revenue
    };
    if(theater) {
        return res.status(200).send(theaterRevenue);
    } else {
        return res.status(404).send({});
    }
})

module.exports = router; //exports