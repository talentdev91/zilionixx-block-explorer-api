var express = require("express");
const EpochController = require("../controllers/EpochController");

var router = express.Router();

// @route    GET api/v1/tx/epochs
// @desc     Tests Epoch Route
// @access   Public

router.get("/test", (req, res) => res.json({ msg: "Epoch works" }));

// @route    GET api/v1/epochs
// @desc     Get epochs tokens
// @access   Public

router.get("/epochs", EpochController.getEpochs);

// @route    GET api/v1/epoch
// @desc     Get selected epoch's Detail
// @access   Public
router.get("/epoch/:epochNumber", EpochController.epochDetail);

module.exports = router;
