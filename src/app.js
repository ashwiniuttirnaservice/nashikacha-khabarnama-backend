const express = require("express");
const cors = require("cors");
const newsRouter = require("./routes/newsRoutes");
const rashiRouter = require("./routes/rashiRoutes");
const videoRouter = require("./routes/videoRoutes");
const breakingRouter = require("./routes/breakingRoutes");
const galleryRouter = require("./routes/galleryRoutes");
const adminRouter = require("./routes/adminRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));


app.use("/api/v1/news", newsRouter);
app.use("/api/v1/rashi", rashiRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/gallery", galleryRouter)
app.use("/api/v1/breaking", breakingRouter)
app.use("/api/v1/admin", adminRouter)

module.exports = app;