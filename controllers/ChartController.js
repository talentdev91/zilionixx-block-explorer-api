var lodash = require("lodash");
const Transaction = require("../models/TransactionModel");
const Block = require("../models/BlockModel");

exports.dailyTxns = async (req, res) => {
  var today = new Date();
  const currentTimestamp = Math.round(today.getTime() / 1000);
  const lastTimestamp = currentTimestamp - 365 * 86400;
  const blocks = await Block.find(
    {
      timestamp: { $gte: lastTimestamp, $lt: currentTimestamp },
    },
    { _id: 0, transactions: 1, timestamp: 2 }
  ).lean();

  var blocksLength = blocks.length;
  var txnsCntArray = new Array(365).fill(0);
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

exports.dailyTokens = async (req, res) => {
  var today = new Date();
  const currentTimestamp = Math.round(today.getTime() / 1000);
  const lastTimestamp = currentTimestamp - 365 * 86400;
  const blocks = await Block.find(
    {
      timestamp: { $gte: lastTimestamp, $lt: currentTimestamp },
    },
    { _id: 0, number: 1, timestamp: 2 }
  );
  const blocksLength = blocks.length;
  const startBlockNumber = blocks[0].number;
  const lastBlockNumber = blocks[blocksLength - 1].number;

  var tokenTxnTransferArray = [];
  tokenTxnTransferArray = await Transaction.find(
    {
      blockNumber: {
        $gte: startBlockNumber,
        $lt: lastBlockNumber,
      },
      token: { $exists: true },
    },
    { _id: 0, blockNumber: 1 }
  ).lean();
  const tokenTxnCountsInSameBlock = {};
  tokenTxnTransferArray.forEach(function (tokenTxnTransfer) {
    tokenTxnCountsInSameBlock[tokenTxnTransfer.blockNumber] =
      (tokenTxnCountsInSameBlock[tokenTxnTransfer.blockNumber] || 0) + 1;
  });

  var tokenArray = new Array(365).fill(0);
  var deliminator = lastTimestamp + 86400;
  var countDayInLoop = 0;

  for (let i = 0; i < blocksLength; i++) {
    if (blocks[i].timestamp < deliminator) {
      blockTokenTxnCount = tokenTxnCountsInSameBlock[blocks[i].number] || 0;
      tokenArray[countDayInLoop] += blockTokenTxnCount;
    } else {
      deliminator += 86400;
      countDayInLoop += 1;
    }
  }

  res.json({
    tokenArray: tokenArray,
  });
};

exports.dailyNewAddress = async (req, res) => {
  var today = new Date();
  console.log("Non-solved: address timestamp");
  try {
    var txnsCntArray = [];
    for (let i = 365; i >= 1; i--) {
      var yesterday = Math.round(
        new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - i
        ).getTime() / 1000
      );
      var blocks = await Block.find({
        timestamp: { $gte: yesterday, $lt: yesterday + 86400 },
      }).lean();
      var txn = 0;
      for (let j = 0; j < blocks.length; j++) {
        var token = await Transaction.find({
          $and: [
            { blockNumber: blocks[j].number },
            { token: { $exists: true } },
          ],
        })
          .count()
          .lean();
        txn += token;
      }
      txnsCntArray.push([yesterday * 1000, txn]);
    }
    res.json({
      txnsCntArray: txnsCntArray,
    });
  } catch (err) {
    console.log("get detail of transaction error" + err);
  }
};

exports.averageBlockSize = async (req, res) => {
  var today = new Date();
  const currentTimestamp = Math.round(today.getTime() / 1000);
  const lastTimestamp = currentTimestamp - 365 * 86400;
  const blocks = await Block.find(
    {
      timestamp: { $gte: lastTimestamp, $lt: currentTimestamp },
    },
    { _id: 0, size: 1, timestamp: 2 }
  ).lean();
  var blocksLength = blocks.length;
  var dailyBlockSize = 0;
  var blockSize = new Array(365).fill(0);
  var countDayInLoop = 0;
  var deliminator = lastTimestamp + 86400;
  var blocksInADay = 0;
  for (let i = 0; i < blocksLength; i++) {
    blocksInADay++;
    if (blocks[i].timestamp < deliminator) {
      dailyBlockSize += blocks[i].size;
    } else {
      blockSize[countDayInLoop] = dailyBlockSize / blocksInADay;
      deliminator += 86400;
      countDayInLoop += 1;
      dailyBlockSize = 0;

      blocksInADay = 0;
    }
  }
  blockSize[364] /= blocksInADay;
  res.json({
    averageblock: blockSize,
  });
};

exports.averageBlockTime = async (req, res) => {
  var today = new Date();
  const currentTimestamp = Math.round(today.getTime() / 1000);
  const lastTimestamp = currentTimestamp - 365 * 86400;
  const blocks = await Block.find(
    {
      timestamp: { $gte: lastTimestamp, $lt: currentTimestamp },
    },
    { _id: 0, timestamp: 1 }
  ).lean();
  var blocksLength = blocks.length;
  var blockTime = new Array(365).fill(0);
  var countDayInLoop = 0;
  var deliminator = lastTimestamp + 86400;
  var blocksInADay = 0;
  for (let i = 0; i < blocksLength; i++) {
    if (blocks[i].timestamp < deliminator) {
      blocksInADay++;
    } else {
      blockTime[countDayInLoop] = 86400 / blocksInADay;
      deliminator += 86400;
      countDayInLoop += 1;

      blocksInADay = 0;
    }
  }
  res.json({
    blocktime: blockTime,
  });
};

exports.averageGasPrice = async (req, res) => {
  var today = new Date();
  const currentTimestamp = Math.round(today.getTime() / 1000);
  const lastTimestamp = currentTimestamp - 365 * 86400;
  const blocks = await Block.find(
    {
      timestamp: { $gte: lastTimestamp, $lt: currentTimestamp },
    },
    { _id: 0, timestamp: 1, gasUsed: 2 }
  ).lean();
  var blocksLength = blocks.length;
  var deliminator = lastTimestamp + 86400;
  var gasprice = [];
  var priceArray = [];
  var blocksInADay = 0;
  for (let i = 0; i < blocksLength; i++) {
    if (blocks[i].timestamp < deliminator) {
      blocksInADay++;
      priceArray.push(blocks[i].gasUsed);
    } else {
      var avgprice = lodash.sum(priceArray) / (blocksInADay * Math.pow(10, 9));
      var maxprice = Math.max(...priceArray) / Math.pow(10, 9);
      var minprice = Math.min(...priceArray) / Math.pow(10, 9);
      gasprice.push([avgprice, maxprice, minprice]);

      deliminator += 86400;
      priceArray = [];
      blocksInADay = 0;
    }
  }
  res.json({
    gasprice: gasprice,
  });
};

exports.totalGasPrice = async (req, res) => {
  var today = new Date();
  const currentTimestamp = Math.round(today.getTime() / 1000);
  const lastTimestamp = currentTimestamp - 365 * 86400;
  const blocks = await Block.find(
    {
      timestamp: { $gte: lastTimestamp, $lt: currentTimestamp },
    },
    { _id: 0, timestamp: 1, gasUsed: 2 }
  ).lean();
  var blocksLength = blocks.length;
  var deliminator = lastTimestamp + 86400;
  var totalgas = [];
  var dailyGas = 0;

  for (let i = 0; i < blocksLength; i++) {
    if (blocks[i].timestamp < deliminator) {
      dailyGas += blocks[i].gasUsed;
    } else {
      totalgas.push(dailyGas);
      deliminator += 86400;
      dailyGas = 0;
    }
  }
  res.json({
    totalgas: totalgas,
  });
};

exports.blockReward = async (req, res) => {
  var today = new Date();
  const currentTimestamp = Math.round(today.getTime() / 1000);
  const lastTimestamp = currentTimestamp - 365 * 86400;
  const blocks = await Block.find(
    {
      timestamp: { $gte: lastTimestamp, $lt: currentTimestamp },
    },
    { _id: 0, timestamp: 1, number: 2 }
  ).lean();
  var blocksLength = blocks.length;

  const txns = await Transaction.find(
    {
      blockNumber: {
        $gte: blocks[0].number,
        $lt: blocks[blocksLength - 1].number,
      },
    },
    { _id: 0, gasUsed: 1, gas: 2, gasPrice: 3, blockNumber: 4 }
  ).lean();

  var deliminator = lastTimestamp + 86400;
  var dayDeliminatorsByNumber = [];
  for (let i = 0; i < blocksLength; i++) {
    if (blocks[i].timestamp > deliminator) {
      dayDeliminatorsByNumber.push(blocks[i].number);
      deliminator += 86400;
    }
  }
  var dayDeliminator = dayDeliminatorsByNumber[0];

  var blockRewards = new Array(365).fill(0);
  var day = 0;
  const transactionsLength = txns.length;
  for (let i = 0; i < transactionsLength; i++) {
    if (txns[i].blockNumber < dayDeliminator) {
      blockRewards[day] +=
        txns[i].gasUsed * txns[i].gasPrice || txns[i].gas * txns[i].gasPrice;
    } else {
      day++;
      dayDeliminator = dayDeliminatorsByNumber[day];
    }
  }

  res.json({
    totalblockreward: blockRewards,
  });
};

exports.pendingtxn = async (req, res) => {
  var today = new Date();
  const currentTimestamp = Math.round(today.getTime() / 1000);
  const lastTimestamp = currentTimestamp - 4 * 86400;
  const blocks = await Block.find(
    {
      timestamp: { $gte: lastTimestamp, $lt: currentTimestamp },
    },
    { _id: 0, timestamp: 1, transactions: 2 }
  ).lean();
  var blocksLength = blocks.length;
  // var pendingTxns = new Array(5760).fill(0);
  var pendingTxns = [];
  var countDayInLoop = 0;
  var pendings = 0;
  var deliminator = lastTimestamp + 60;

  for (let i = 0; i < blocksLength; i++) {
    if (blocks[i].timestamp < deliminator) {
      // console.log(blocks[i].transactions);
      pendings += blocks[i].transactions.length;
    } else {
      pendingTxns.push(pendings);
      deliminator += 60;
      countDayInLoop += 1;
    }
  }
  res.json({
    minpendingtxns: pendingTxns,
  });
};

exports.transactionFee = async (req, res) => {
  var today = new Date();
  const currentTimestamp = Math.round(today.getTime() / 1000);
  const lastTimestamp = currentTimestamp - 365 * 86400;
  const blocks = await Block.find(
    {
      timestamp: { $gte: lastTimestamp, $lt: currentTimestamp },
    },
    { _id: 0, timestamp: 1, number: 2 }
  ).lean();
  var blocksLength = blocks.length;

  const txns = await Transaction.find(
    {
      blockNumber: {
        $gte: blocks[0].number,
        $lt: blocks[blocksLength - 1].number,
      },
    },
    { _id: 0, gasUsed: 1, gas: 2, gasPrice: 3, blockNumber: 4 }
  ).lean();

  var deliminator = lastTimestamp + 86400;
  var dayDeliminatorsByNumber = [];
  for (let i = 0; i < blocksLength; i++) {
    if (blocks[i].timestamp > deliminator) {
      dayDeliminatorsByNumber.push(blocks[i].number);
      deliminator += 86400;
    }
  }
  var dayDeliminator = dayDeliminatorsByNumber[0];

  var TxnFees = new Array(365).fill(0);
  var day = 0;
  const transactionsLength = txns.length;
  for (let i = 0; i < transactionsLength; i++) {
    if (txns[i].blockNumber < dayDeliminator) {
      TxnFees[day] +=
        (txns[i].gasUsed * txns[i].gasPrice) / Math.pow(10, 18) ||
        (txns[i].gas * txns[i].gasPrice) / Math.pow(10, 18);
    } else {
      day++;
      dayDeliminator = dayDeliminatorsByNumber[day];
    }
  }
  res.json({
    dailytxnfees: TxnFees,
  });
};

exports.utilization = async (req, res) => {
  var today = new Date();
  const currentTimestamp = Math.round(today.getTime() / 1000);
  const lastTimestamp = currentTimestamp - 365 * 86400;
  const blocks = await Block.find(
    {
      timestamp: { $gte: lastTimestamp, $lt: currentTimestamp },
    },
    { _id: 0, timestamp: 1, number: 2 }
  ).lean();
  var blocksLength = blocks.length;
  var utils = [];
  var countDayInLoop = 0;
  var gasused = 0;
  var gause = 0;
  var deliminator = lastTimestamp + 86400;
  var utilNo = 0;
  var gasutil = 0;

  for (let i = 0; i < blocksLength; i++) {
    if (blocks[i].timestamp < deliminator) {
      utilNo++;

      gause = blocks[i].gasUsed - blocks[i].gasLimit;
      if (gause > 0) {
        gasused += gause;
      } else {
        gasused += 0;
      }
    } else {
      gasutil = (gasused / utilNo) * 100;
      utils.push(gasutil);
      deliminator += 86400;
      utilNo += 1;
    }
  }
  res.json({
    utilization: utils,
  });
};
