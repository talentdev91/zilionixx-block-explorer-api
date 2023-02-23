var express = require("express");
var blockRouter = require("./block");
var transactionRouter = require("./transaction");
var addressRouter = require("./address");
var validatorRouter = require("./validator");
var tokenRouter = require("./token");
var epochRouter = require("./epoch");
var chartRouter = require("./chart");
var searchRouter = require("./search");
var authRouter = require("./auth");
var web3Router = require("./web3");
var contractRouter = require("./contract");
var publicApiRouter = require("./publicApi");
var statisticsRouter = require("./statistics");
var userRouter = require("./user");
var adminRouter = require("./admin");
var feedbackRouter = require("./feedback");

var publicApiMiddleware = require("../middlewares/apiKeyValidate");
var publicApiLimitterMiddleware = require("../middlewares/customLimitterByApiKey");
const passport = require("passport"); // used for protected routes

var app = express();
// app.use(express.json({ limit: "50mb" }));
app.use("/v1/block/", blockRouter);
app.use("/v1/tx/", transactionRouter);
app.use("/v1/address/", addressRouter);
app.use("/v1/validator/", validatorRouter);
app.use("/v1/feedback/", feedbackRouter);
app.use(
  "/v1/user/",
  passport.authenticate("jwt", { session: false }),
  userRouter
);
app.use(
  "/v1/admin/",
  passport.authenticate("jwt", { session: false }),
  adminRouter
);
app.use("/v1/", tokenRouter);
app.use("/v1/", epochRouter);
app.use("/v1/", chartRouter);
app.use("/v1/", searchRouter);
app.use("/v1/", authRouter);
app.use("/v1/", web3Router);
app.use("/v1/", contractRouter);
app.use("/v1/", statisticsRouter);
app.use(
  "/",
  [publicApiMiddleware, publicApiLimitterMiddleware],
  publicApiRouter
);

module.exports = app;
