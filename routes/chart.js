var express = require("express");
const ChartController = require("../controllers/ChartController");

var router = express.Router();

// @route    GET api/v1/tx/test
// @desc     Tests Transaction Route
// @access   Public

router.get("/test", (req, res) => res.json({ msg: "Chart works" }));

router.get("/dailytxn", ChartController.dailyTxns);
router.get("/erc20txns", ChartController.dailyTokens);
router.get("/address", ChartController.dailyNewAddress);
router.get("/blocksize", ChartController.averageBlockSize);
router.get("/blocktime", ChartController.averageBlockTime);
router.get("/gasprice", ChartController.averageGasPrice);
router.get("/totalgas", ChartController.totalGasPrice);
router.get("/blockreward", ChartController.blockReward);
router.get("/pendingtxn", ChartController.pendingtxn);
router.get("/transactionfee", ChartController.transactionFee);
router.get("/utilization", ChartController.utilization);

module.exports = router;
