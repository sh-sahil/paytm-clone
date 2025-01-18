const mongoose = require("mongoose");

const connectDB = async () => {
  mongoose
    .connect("mongodb://localhost:27017/paytmclone", {})
    .then(() => {
      console.log("Database connected");
    })
    .catch(err => {
      console.log("Error connecting to the database", err);
    });
};

module.exports = { connectDB };
