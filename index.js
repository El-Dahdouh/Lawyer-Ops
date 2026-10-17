require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const app = express();
const PORT = process.env.PORT || 8000;

connectDB();

mongoose.connection.once ("open", () =>{
    console.log("DB Connected");
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
})

mongoose.connection.on("error", (err) => {
    console.log(err);
})