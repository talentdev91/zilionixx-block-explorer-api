var express = require("express");
const web3Controller = require("../controllers/Web3ApiController");

var router = express.Router();

// @route    GET api/
// @query    module=account
// @desc     Broadcast hex-encoded raw txn to blockchain
// @access   Public

router.get("/api", web3Controller.publicApis);

module.exports = router;
