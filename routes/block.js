var express = require("express");
const BlockController = require("../controllers/BlockController");

var router = express.Router();

// @route    GET api/v1/block/test
// @desc     Tests Block Route
// @access   Public

router.get("/test", (req, res) => res.json({ msg: "Block works" }));

// @route    GET api/v1/block/latestTenBlocks
// @desc     Get latest 10 blocks
// @access   Public

router.get("/latestTenBlocks", BlockController.latestTenBlocks);

// @route    GET api/v1/block/blockDetail
// @desc     Get selected block's Detail
// @access   Public

router.get("/blockDetail/:blockNumber", BlockController.blockDetail);

// @route    GET api/v1/block/allBlocks
// @desc     Get all block records
// @access   Public

router.get("/allBlocks/:page/:rowsPerPage", BlockController.allBlocks);

// @route    GET api/v1/block/getBlockTransactions
// @desc     Get selected Block's transaction records
// @access   Public

router.get(
  "/getBlockTransactions/:blocknumber/:page/:rowsPerPage",
  BlockController.getBlockTransactions
);

// @route    GET api/v1/block/getLatestChainInfo
// @desc     Get latest chain information
// @access   Public

router.get("/getLatestChainInfo", BlockController.getLatestChainInfo);

module.exports = router;
