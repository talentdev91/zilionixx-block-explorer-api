var express = require("express");
var healthRouter = require("./health");

var app = express();
// app.use(express.json({ limit: "50mb" }));
app.use("/health", healthRouter);

module.exports = app;
