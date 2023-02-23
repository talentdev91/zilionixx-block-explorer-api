var express = require("express");
const SearchController = require("../controllers/SearchController");

var router = express.Router();

// @route    GET api/v1/tx/epochs
// @desc     Tests Epoch Route
// @access   Public

router.get("/test", (req, res) => res.json({ msg: "Epoch works" }));

// @route    GET api/v1/epochs
// @desc     Get epochs token
// @access   Public

router.get("/search", SearchController.getSearch);

module.exports = router;
