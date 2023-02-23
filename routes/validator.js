var express = require("express");
const ValidatorController = require("../controllers/ValidatorController");

var router = express.Router();

// @route    GET api/v1/validator/test
// @desc     Tests Validator Route
// @access   Public

router.get("/test", (req, res) => res.json({ msg: "Validator works" }));

// @route    GET api/v1/validator
// @desc     Get address info
// @access   Public

router.get("/", ValidatorController.getValidatorsTopLeaderboard);

module.exports = router;
