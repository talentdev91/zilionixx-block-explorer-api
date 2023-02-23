require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var indexRouter = require("./routes/index");
var apiRouter = require("./routes/api");
var apiResponse = require("./helpers/apiResponse");
var reqLogger = require("./middlewares/reqLogger");
var cors = require("cors");
const passport = require("passport");
var initDB = require("./seeds/InitDB");
var dailyReport = require("./seeds/DailyReport");

//custom rate limiter using redis and moment
const rateLimiter = require("./middlewares/customLimitter");

// DB connection
var mongoDB =
  "mongodb://" +
  process.env.MONGODB_URL +
  ":" +
  process.env.MONGODB_PORT +
  "/" +
  process.env.MONGODB_DATABASE;

var mongoose = require("mongoose");

mongoose
  .connect(mongoDB, {
    user: process.env.MONGODB_USER,
    pass: process.env.MONGODB_PASSWORD,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    //don't show the log when it is test
    if (process.env.NODE_ENV !== "test") {
      console.log("Connected to %s", mongoDB);
      console.log("MongoDB is connected ... \n");

      initDB.InitializeDB();
      // dailyReport.DailyReport();
    }
  })
  .catch((err) => {
    console.error("App starting error:", err.message);
    process.exit(1);
  });
var app = express();

//Passport Middleware
app.use(passport.initialize());
//Rate limit Middleware

// Passport Config
require("./config/passport")(passport);

//don't show the log when it is test
if (process.env.NODE_ENV !== "test") {
  app.use(logger("dev"));
}
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//To allow cross-origin requests
app.use(cors());
//Route Prefixes
app.use("/", indexRouter);
app.use("/api/", [reqLogger], apiRouter);
app.use("/uploads", express.static(__dirname + "/uploads"));
// throw 404 if URL not found
app.all("*", function (req, res) {
  return apiResponse.notFoundResponse(res, "Page not found");
});

app.use((err, req, res) => {
  if (err.name == "UnauthorizedError") {
    return apiResponse.unauthorizedResponse(res, err.message);
  }
});

module.exports = app;
