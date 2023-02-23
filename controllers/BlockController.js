const BlockchainStatus = require("../models/BlockchainStatusModel");
const Block = require("../models/BlockModel");
const Transaction = require("../models/TransactionModel");
const Validator = require("../models/ValidatorModel");
const { constants } = require("../config/constants");

exports.latestTenBlocks = async (req, res) => {
  try {
    var sortByTimestampQry = { number: -1 };

    var blocks = await Block.find().lean().sort(sortByTimestampQry).limit(10);
    var blocksLength = blocks.length;

    var blockRewards = [];
    for (let i = 0; i < blocksLength; i++) {
      blockRewards.push(blocks[i].blockReward / Math.pow(10, 18));
    }
    res.json({
      success: true,
      blocks: blocks,
      blockReward: blockRewards,
    });
  } catch (err) {
    console.log("get latest ten blocks error: " + err);
    res.json({
      success: false,
      err: "get latest ten blocks error",
    });
  }
};

exports.blockDetail = async (req, res) => {
  var blockNumber = req.params.blockNumber;
  var isNumber = /^\d+$/.test(blockNumber);
  const errors = {};
  var findByBlocknumberQry;
  if (isNumber) {
    findByBlocknumberQry = { number: blockNumber };
  } else {
    findByBlocknumberQry = { hash: blockNumber };
  }

  try {
    const blockchainStatus = await BlockchainStatus.findOne().lean().sort({
      updatedAt: -1,
    });
    const lastBlockNumber = blockchainStatus.syncno;

    const block = await Block.findOne(findByBlocknumberQry);
    var blockReward = block.blockReward;

    var blockTransactionsCount = await Transaction.countDocuments({
      $and: [{ blockNumber: block.number }, { input: { $ne: "0x" } }],
    });

    res.status(200).json({
      success: true,
      block: block,
      blockReward: blockReward,
      InternalTxns: blockTransactionsCount,
      lastBlockNumber: lastBlockNumber,
    });
  } catch (err) {
    console.log("get block detail error: " + err);
    res.json({
      success: false,
      err: "get block detail error",
    });
  }
};

exports.allBlocks = async (req, res) => {
  const page = parseInt(req.params.page) + 1;
  const rowsPerPage = parseInt(req.params.rowsPerPage);
  const skipIndex = (page - 1) * rowsPerPage;
  var sortByBlockNumberQry = { number: -1, _id: 1 };

  try {
    const latestBlock = await Block.findOne().lean().sort({ timestamp: -1 });
    const totalBlocksCnt = latestBlock.number;

    const blocks = await Block.find({})
      .allowDiskUse()
      .lean()
      .sort(sortByBlockNumberQry)
      .limit(rowsPerPage)
      .skip(skipIndex);
    const blockReward = [];
    var transaction;
    var sum = 0;
    for (let i = 0; i < blocks.length; i++) {
      blockReward[i] = blocks[i].blockReward / Math.pow(10, 18);
    }

    res.status(200).json({
      success: true,
      blocks: blocks,
      totalBlocksCnt: totalBlocksCnt,
      blockReward: blockReward,
    });
  } catch (err) {
    console.log("get all blocks error: " + err);
    res.json({
      success: false,
      err: "get all blocks error",
    });
  }
};

exports.getBlockTransactions = async (req, res) => {
  try {
    const blockNumber = req.params.blocknumber;
    const page = parseInt(req.params.page) + 1;
    const rowsPerPage = parseInt(req.params.rowsPerPage);
    const skipIndex = (page - 1) * rowsPerPage;

    const txnsData = await Transaction.find({ blockNumber: blockNumber })
      .lean()
      .sort({ timestamp: -1 })
      .limit(rowsPerPage)
      .skip(skipIndex);

    const block = await Block.findOne({ number: blockNumber }).lean();

    var totalTxnsCnt = await Transaction.countDocuments({
      blockNumber: blockNumber,
    });
    res.status(200).json({
      success: true,
      txns: txnsData,
      totalTxnsCnt: totalTxnsCnt,
      txnstimestamp: block.timestamp,
    });
  } catch (err) {
    console.log("get transactions for selected Block error: " + err);
    res.json({
      success: false,
      err: "get transactions for selected Block error",
    });
  }
};

exports.getLatestChainInfo = async (req, res) => {
  try {
    //last block number and epoch number

    const blockchainStatus = await BlockchainStatus.findOne(
      {},
      { syncno: 1, epoch_syncno: 1, _id: 0 },
      { sort: { updatedAt: -1 } }
    );
    const lastBlockNumber = blockchainStatus.syncno;
    const lastEpochNumber = blockchainStatus.epoch_syncno;

    //tps(transactions per second) and count of total transactions

    const firstBlock = await Block.findOne().lean().sort({ timestamp: 1 });
    const lastBlock = await Block.findOne().lean().sort({ timestamp: -1 });

    var totalTxnsCnt = await Transaction.countDocuments({
      from: { $ne: constants.ZERO_ADDRESS },
      to: { $ne: constants.ZERO_ADDRESS },
    });
    const diffTime = lastBlock.timestamp - firstBlock.timestamp;
    const tps = (totalTxnsCnt / diffTime).toFixed(3);

    //average time that block is created about latest 5000 blocks

    const latestBlocks = await Block.find()
      .lean()
      .sort({ timestamp: -1 })
      .limit(5000);
    var totalDiffTimeOfBlocks = 0;
    var avgBlockTime = 0;
    if (latestBlocks.length === 0) {
      avgBlockTime = 0;
    } else {
      for (var i = 0; i < latestBlocks.length - 1; i++) {
        var diffTimeOfBlocks =
          latestBlocks[i].timestamp - latestBlocks[i + 1].timestamp;
        totalDiffTimeOfBlocks += diffTimeOfBlocks;
      }

      avgBlockTime = (totalDiffTimeOfBlocks / latestBlocks.length).toFixed(3);
    }

    //count of active validator
    const activeValidatorCnt = await Validator.countDocuments({ active: true });

    //latest chain information
    const latestChainInfo = {
      tps: tps,
      avgBlockTime: avgBlockTime,
      totalTxnsCnt: totalTxnsCnt,
      lastBlockNumber: lastBlockNumber,
      lastEpochNumber: lastEpochNumber,
      activeValidatorCnt: activeValidatorCnt,
    };

    res.status(200).json({
      success: true,
      latestChainInfo: latestChainInfo,
    });
  } catch (err) {
    console.log("get latest chain info error: " + err);
    res.json({
      success: false,
      err: "get latest chain info error",
    });
  }
};
