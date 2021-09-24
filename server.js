const express = require("express"); //backend framework
const morgan = require("morgan"); //logger
const helmet = require("helmet"); //makes API requests more secure

const connectDB = require("./db"); //   ./ means you are in the current folder, db = name of the folder
const consumer = require("./routes/api/consumer");

const app = express();
const port = 5000;

app.use(express.urlencoded({ extended: false })); //takes in network request and turns it into a JSON
app.use(express.json());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*'); // * = give access to anyone (front end app) who calls backend
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, OPTIONS, DELETE'); // these requests are allowed
    next();
});

app.use(morgan("dev"));
app.use(helmet());
connectDB();
app.use("/api/v1/consumer", consumer);

// http://localhost:5000/api/v1/consumer/register/theater
// http://localhost:5000/api/v1/consumer/register/movie
// http://localhost:5000/api/v1/consumer/register/showing
// http://localhost:5000/api/v1/consumer/fetch/theaters
// http://localhost:5000/api/v1/consumer/fetch/movies/:theaterID
// http://localhost:5000/api/v1/consumer/fetch/movie/:movieID
// http://localhost:5000/api/v1/consumer/fetch/available/showings/:movieID

app.listen(port, () => console.log(`API server listening on ${port}`)); // ` allows you to pass in variables to the string