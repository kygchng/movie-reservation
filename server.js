const express = require("express"); //backend framework
const morgan = require("morgan"); //logger
const helmet = require("helmet"); //makes API requests more secure

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

app.listen(port, () => console.log(`API server listening on ${port}`)); // ` allows you to pass in variables to the string