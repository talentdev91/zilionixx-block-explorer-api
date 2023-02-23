var express = require("express");
const TransactionController = require("../controllers/TransactionController");

var router = express.Router();

// @route    GET api/v1/tx/test
// @desc     Tests Transaction Route
// @access   Public

router.get("/test", (req, res) => res.json({ msg: "Transaction works" }));

// @route    GET api/v1/tx/latestTenTxns
// @desc     Get latest 10 transactions
// @access   Public

router.get("/latestTenTxns", TransactionController.latestTenTxns);

// @route    GET api/v1/tx/transactionDetail
// @desc     Get selected transaction's Detail
// @access   Public

router.get(
  "/transactionDetail/:transactionHash",
  TransactionController.transactionDetail
);

// @route    GET api/v1/tx/allTransactions
// @desc     Get last 500k transaction records
// @access   Public

router.get(
  "/allTransactions/:page/:rowsPerPage",
  TransactionController.allTransactions
);

router.get(
  "/pendingTransactions/:page/:rowsPerPage",
  TransactionController.pendingTransactions
);

// @route    GET api/v1/tx/transactionHistory
// @desc     Get transaction history of last 14 days
// @access   Public

router.get("/transactionHistory", TransactionController.transactionHistory);

// @route    GET api/v1/tx/allTransactions
// @desc     Get last 500k transaction records
// @access   Public

router.get(
  "/internalTransactions/:page/:rowsPerPage",
  TransactionController.internalTransactions
);
module.exports = router;
