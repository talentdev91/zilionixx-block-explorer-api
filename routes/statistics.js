var express = require("express");
const StatisticsController = require("../controllers/StatisticsController");

var router = express.Router();

// @route    GET api/v1/epochs
// @desc     Get epochs tokens
// @access   Public

router.get("/stat/token", StatisticsController.getTokenStat);
router.get("/topvalues", StatisticsController.getTopValues);
router.get("/stat/network", StatisticsController.getNetworkStat);
router.get("/topTxns", StatisticsController.getTopTXNs);

module.exports = router;
