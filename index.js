require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const corsOptions = require("./config/corsOption");
const app = express();
const PORT = process.env.PORT || 8000;

// DB connection
connectDB();

// middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/auth", require("./routes/authRoutes"));

app.get("/", (req, res) => {
    res.send("Welcome to the Lawyer Management System API");
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