const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { connectDB } = require("./db");
const mainRouter = require("./routes/index");

connectDB();

const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());

app.use("/api/v1", mainRouter);

app.listen(PORT, () => {
  console.log("Server is running on PORT", PORT);
});
