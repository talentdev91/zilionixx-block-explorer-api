var express = require("express");
const web3Controller = require("../controllers/Web3ApiController");

var router = express.Router();

// @route    GET api/v1/web3/broadcastTx
// @desc     Broadcast hex-encoded raw txn to blockchain
// @access   Public

router.post("/web3/broadcastTx", web3Controller.broadcastTx);
router.post("/web3/byteToOpcode", web3Controller.byteToOpcode);

module.exports = router;
