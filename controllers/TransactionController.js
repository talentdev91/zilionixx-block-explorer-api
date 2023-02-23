const Transaction = require("../models/TransactionModel");
const Block = require("../models/BlockModel");
const Token = require("../models/TokenModel");
const Event = require("../models/EventModel");
const PendingTransaction = require("../models/PendingTransactionModel");
const Web3 = require("web3");
const { constants } = require("../config/constants");
const tokentype = require("../config/tokentype.json");

var ethers = require("ethers");
var web3 = new Web3(constants.WEB3_PROVIDER);

const chunkString = (str, length) => {
  return str.match(new RegExp(".{1," + length + "}", "g"));
};

exports.latestTenTxns = async (req, res) => {
  var sortByBlockNumberQry = { blockNumber: -1 };
  try {
    const latestTransactions = await Transaction.find({
      from: { $ne: constants.ZERO_ADDRESS },
      to: { $ne: constants.ZERO_ADDRESS },
    })
      .lean()
      .sort(sortByBlockNumberQry)
      .limit(10);

    res.status(200).json({
      success: true,
      txns: latestTransactions,
    });
  } catch (err) {
    console.log("get latest ten txns error" + err);
  }
};

exports.transactionDetail = async (req, res) => {
  try {
    transactionHash = req.params.transactionHash;

    var findByTransactionHashQry = { hash: transactionHash };

    const latestBlock = await Block.findOne().lean().sort({ timestamp: -1 });

    var transaction = await Transaction.findOne(
      findByTransactionHashQry
    ).lean();

    const blockConfirmation = latestBlock.number - transaction.blockNumber;
    const timestamp = transaction.timestamp;

    const transactionLogsLength = transaction.logs.length;
    if (transactionLogsLength > 0) {
      for (let i = 0; i < transactionLogsLength; i++) {
        try {
          const findByEventKeccakQry = {
            keccak: transaction.logs[i].topics[0],
          };
          const event = await Event.findOne(findByEventKeccakQry);

          console.log(transaction.logs[i].topics.slice(1));
          const decodedLog = web3.eth.abi.decodeLog(
            event.inputs,
            transaction.logs[i].data,
            transaction.logs[i].topics.slice(1)
          );
          const tokenDetail = {
            name: event.name,
            params: decodedLog,
            inputs: event.inputs,
          };
          transaction.logs[i].topicDetail = tokenDetail;
        } catch (err) {
          console.log("Anonymous event or network connection problem");
        }
      }
    }

    if (transaction.token) {
      var decodeMethod = {};
      decodeMethod.original = transaction.input;
      decodeMethod.default = {};
      decodeMethod.default["methodId"] = decodeMethod.original.slice(0, 9);
      if (decodeMethod.original.length > 10) {
        decodeMethod.default.data = chunkString(
          decodeMethod.original.slice(10),
          64
        );
      }
      decodeMethod.utf8 = Buffer.from(
        decodeMethod.original.slice(2),
        "hex"
      ).toString("utf8");
      if (
        transaction.token.decodeMethodData.types &&
        transaction.token.decodeMethodData.types.length > 0
      ) {
        decodeMethod.decodeData = [];
        var param = transaction.token.decodeMethodData;
        console.log(param);

        for (
          let i = 0;
          i < transaction.token.decodeMethodData.types.length;
          i++
        ) {
          decodeMethod.decodeData.push({
            id: i,
            name: param.names[i],
            type: param.types[i],
            data: param.inputs[i],
          });
        }
      }
    }
    transaction.decodeMethod = decodeMethod;
    res.status(200).json({
      success: true,
      transaction: transaction,
      blockConfirmation: blockConfirmation,
      timestamp: timestamp,
    });
  } catch (err) {
    console.log("get detail of transaction error" + err);
  }
};

exports.allTransactions = async (req, res) => {
  const page = parseInt(req.params.page) + 1;
  const rowsPerPage = parseInt(req.params.rowsPerPage);
  const skipIndex = (page - 1) * rowsPerPage;

  var txns = { docs: [], totalDocs: 0 };

  var totalTxnsCnt = 0;

  try {
    totalTxnsCnt = await Transaction.countDocuments({
      from: { $ne: constants.ZERO_ADDRESS },
      to: { $ne: constants.ZERO_ADDRESS },
    });

    txns.docs = await Transaction.find({
      from: { $ne: constants.ZERO_ADDRESS },
      to: { $ne: constants.ZERO_ADDRESS },
    })
      .allowDiskUse()
      .lean()
      .skip(skipIndex)
      .sort({ blockNumber: -1 })
      .limit(rowsPerPage);
    txns.totalDocs = await Transaction.countDocuments({
      from: { $ne: constants.ZERO_ADDRESS },
      to: { $ne: constants.ZERO_ADDRESS },
    });

    var txnstimestamp = [];
    var blockConfirmation = [];
    const lastblock = await Block.findOne().lean().sort({ timestamp: -1 });

    for (let i = 0; i < txns.docs.length; i++) {
      txnstimestamp[i] = txns.docs[i].timestamp;
      blockConfirmation[i] = lastblock.number - txns.docs[i].blockNumber;
    }
    res.status(200).json({
      success: true,
      txns: txns.docs,
      txnstimestamp: txnstimestamp,
      blockConfirmation: blockConfirmation,
      totalTxnsCnt: totalTxnsCnt,
    });
  } catch (err) {
    console.log("get detail of transaction error" + err);
  }
};

exports.pendingTransactions = (req, res) => {
  const page = parseInt(req.params.page) + 1;
  const rowsPerPage = parseInt(req.params.rowsPerPage);
  const skipIndex = (page - 1) * rowsPerPage;
  var sortByBlockNumberQry = { blockNumber: -1 };
  var totalTxnsCnt = 0;

  PendingTransaction.count()
    .exec()
    .then((count) => {
      totalTxnsCnt = count;
    })
    .catch((err) => res.status(404).json(err));

  PendingTransaction.find()
    .lean()
    .sort(sortByBlockNumberQry)
    .limit(rowsPerPage)
    .skip(skipIndex)
    .exec()
    .then((txns) => {
      if (!txns) {
        // errors.notxns = "There is no pending transaction";
      } else {
        if (totalTxnsCnt <= 500000) {
          res.status(200).json({
            success: true,
            txns: txns,
            totalTxnsCnt: totalTxnsCnt,
          });
        } else {
          res.status(200).json({
            success: true,
            txns: txns,
            totalTxnsCnt: 500000,
          });
        }
      }
    })
    .catch((err) => res.status(404).json(err));
};

exports.transactionHistory = async (req, res) => {
  var today = new Date();
  const currentTimestamp = Math.round(today.getTime() / 1000);
  const lastTimestamp = currentTimestamp - 15 * 86400;
  const blocks = await Block.find(
    {
      timestamp: { $gte: lastTimestamp, $lt: currentTimestamp },
    },
    { _id: 0, transactions: 1, timestamp: 2 }
  ).lean();

  var blocksLength = blocks.length;
  var txnsCntArray = new Array(15).fill(0);
  var countDayInLoop = 0;
  var deliminator = lastTimestamp + 86400;
  for (let i = 0; i < blocksLength; i++) {
    if (blocks[i].timestamp < deliminator) {
      txnsCntArray[countDayInLoop] += blocks[i].transactions.length;
    } else {
      deliminator += 86400;
      countDayInLoop += 1;
    }
  }
  res.json({
    txnsCntArray: txnsCntArray,
  });
};

exports.internalTransactions = async (req, res) => {
  const page = parseInt(req.params.page) + 1;
  const rowsPerPage = parseInt(req.params.rowsPerPage);
  const skipIndex = (page - 1) * rowsPerPage;
  var internalTxns = { docs: [], totalDocs: 0 };

  var query = { "token.tokenTransfers": { $gte: { $size: 1 } } };

  try {
    internalTxns.docs = await Transaction.find(query)
      .lean()
      .skip(skipIndex)
      .sort({ blockNumber: -1 })
      .limit(rowsPerPage);
    internalTxns.totalDocs = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      internalTxns: internalTxns.docs,
      totalCounts: internalTxns.totalDocs,
    });
  } catch (err) {
    console.log("get detail of transaction error" + err);
  }
};
