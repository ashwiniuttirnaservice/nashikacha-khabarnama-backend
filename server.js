const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const logger = require("./src/config/logger");
const connectDB = require("./src/config/db");
const path = require("path");
dotenv.config();
const app = require("./src/app");


app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.get("/", (req, res) => {
    res.send("API is running...");
});

const PORT = process.env.PORT || 5000;


connectDB().then(() => {

    app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
    });
});
