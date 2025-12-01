// import express from "express";
// import cors from "cors";
// Use this
const hotelRoutes = require("./routes/hotelRoutes.js");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use("/api/hotels", hotelRoutes); // -> /api/hotels/autosuggest

// connect db
connectDB();

// test route
app.get("/", (req, res) => {
  res.send("Server is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
