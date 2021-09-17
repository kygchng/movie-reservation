const mongoose = require("mongoose");

const URI = "mongodb+srv://kylie:hello123@cluster0.7unof.mongodb.net/movie-res?retryWrites=true&w=majority";

const connectDB = async () => {
    await mongoose.connect(URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });
    console.log("MongoDB is successfully connected!");
}

module.exports = connectDB; //access JS functions from one file to another