var express = require("express");
const {
  addressInfo,
  getInternalTxns,
  getErc20Txns,
  getErc721Txns,
  getEvents,
  contractInfo,
  topAccountsByBalance,
  readContract,
  writeContract,
  balanceChecker,
  balanceStat,
  txnStat,
  txnFeesStat,
  transfersStat,
  allStat,
} = require("../controllers/AddressController");
const { createAddress } = require("../controllers/AdminAddressController");

var router = express.Router();

// @route    GET api/v1/block/test
// @desc     Tests Block Route
// @access   Public

router.get("/test", (req, res) => res.json({ msg: "Block works" }));

// @route    GET api/v1/address/addressInfo
// @desc     Get address info
// @access   Public

router.get("/addressInfo/:address", addressInfo);

// @route    GET api/v1/address/internalTxns
// @desc     Get address info
// @access   Public

router.get("/internalTxns/:address", getInternalTxns);

// @route    GET api/v1/address/erc20txns
// @desc     Get address info
// @access   Public

router.get("/erc20txns/:address", getErc20Txns);

// @route    GET api/v1/address/erc721txns
// @desc     Get address info
// @access   Public

router.get("/erc721txns/:address", getErc721Txns);

// @route    GET api/v1/address/erc721txns
// @desc     Get address info
// @access   Public

router.get("/events/:address", getEvents);

// @route    GET api/v1/address/contractInfo
// @desc     Get contract info
// @access   Public

router.get("/contractInfo/:address", contractInfo);

// @route    GET api/v1/address/topAccountsByBalance
// @desc     Get top accounts by znx balance
// @access   Public

router.get("/topAccountsByBalance/:page/:rowsPerPage", topAccountsByBalance);

// @route    GET api/v1/address/topAccountsByBalance
// @desc     Get top accounts by znx balance
// @access   Public

router.post("/admin/create", createAddress);

// @route    POST api/v1/address/readContract/:address
// @desc     POST top accounts by znx balance
// @access   Public

router.post("/readContract/:address", readContract);

// @route    POST api/v1/address/writeContract/:address
// @desc     POST top accounts by znx balance
// @access   Public

router.post("/writeContract/:address", writeContract);

// @route    POST api/v1/address/balanceChecker/
// @desc     POST track balance history of this account
// @access   Public

router.post("/balanceChecker", balanceChecker);

// @route    POST api/v1/address/statistics/balance/
// @desc     POST track balance history of this account
// @access   Public

router.post("/statistics/balance", balanceStat);

// @route    POST api/v1/address/statistics/txns/
// @desc     POST track txns history of this account
// @access   Public

router.post("/statistics/txns", txnStat);

// @route    POST api/v1/address/statistics/txnFees/
// @desc     POST track txnFees history of this account
// @access   Public

router.post("/statistics/txnFees", txnFeesStat);

// @route    POST api/v1/address/statistics/transfers/
// @desc     POST track transfers history of this account
// @access   Public

router.post("/statistics/transfers", transfersStat);

// @route    POST api/v1/address/statistics/tokenTransfers/
// @desc     POST track tokenTransfers history of this account
// @access   Public

// router.post("/statistics/tokenTransfers", tokenTransfersStat);

// @route    POST api/v1/address/statistics/all/
// @desc     POST track all statistical history of this account
// @access   Public

router.post("/statistics/all", allStat);

module.exports = router;
