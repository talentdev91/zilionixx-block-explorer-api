var express = require("express");
const OtherController = require("../controllers/OtherController");

var router = express.Router();

// @route    GET api/v1/tx/test
// @desc     Tests Transaction Route
// @access   Public

router.get("/", OtherController.healthChecker);

module.exports = router;
