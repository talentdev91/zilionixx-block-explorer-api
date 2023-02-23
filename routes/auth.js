var express = require("express");
const AuthController = require("../controllers/AuthController");
const passport = require("passport"); // used for protected routes
var router = express.Router();

// @route    GET api/auth
// @desc     Tests Auth Route
// @access   Public

router.post(
  "/passport-test",
  passport.authenticate("jwt", { session: false }),
  AuthController.testLoginUser
);

// @route    POST api/auth/register
// @desc     Registe user
// @access   Public

router.post("/auth/register", AuthController.registerUser);

// @route    POST api/auth/register
// @desc     login user
// @access   Public

router.post("/auth/login", AuthController.loginUser);
router.get("/email/confirm", AuthController.collectEmail);

module.exports = router;
