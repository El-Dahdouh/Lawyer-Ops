require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./config/db");
const corsOptions = require("./config/corsOption");
const app = express();
const PORT = process.env.PORT || 8000;

// DB connection
connectDB();

// middleware
app.use(cors(corsOptions));

app.get("/", (req, res) => {
    res.send("Hello World");
})

mongoose.connection.once ("open", () =>{
    console.log("DB Connected");
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
})

mongoose.connection.on("error", (err) => {
    console.log(err);
})