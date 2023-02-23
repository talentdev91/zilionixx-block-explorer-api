const BlockchainStatus = require("../models/BlockchainStatusModel");
const Token = require("../models/TokenModel");
const TokenInfo = require("../models/TokenInfoModel");

const Transaction = require("../models/TransactionModel");
const Block = require("../models/BlockModel");
const Account = require("../models/AddressModel");
const tokentype = require("../config/tokentype.json");

const Web3 = require("web3");
const { constants } = require("../config/constants");
const web3 = new Web3(constants.WEB3_PROVIDER);
const ABI = require("../sync-server/contractABIs/erc20ABI.json");

exports.getFullTimeTokenStat = async (req, res) => {
  var result;

  var unwindByHoldingTokens = {
    $unwind: {
      path: "$holdingTokens",
    },
  };

  var grounpByAddress = {
    $group: {
      _id: "$holdingTokens.address",
      name: { $addToSet: "$holdingTokens.name" },
      count: { $sum: 1 },
    },
  };

  var sortByCount = {
    $sort: { count: -1 },
  };

  var limitResult = { $limit: 20 };

  var pipeline = [
    unwindByHoldingTokens,
    grounpByAddress,
    sortByCount,
    limitResult,
  ];

  try {
    result = await Account.aggregate(pipeline);
  } catch (err) {}

  res.status(200).json({
    success: true,
    count: result.length,
    result: result,
  });
};

const getAggregateResult = async (Model, pipelines) => {
  var results = [],
    promises = [];
  for (let i = 0; i < pipelines.length; i++) {
    let promise = Model.aggregate(pipelines[i]);
    promises.push(promise);
  }

  results = Promise.all(promises);
  return results;
};

const insert = (arr, index, newItem) => [
  // part of the array before the specified index
  ...arr.slice(0, index),
  // inserted item
  newItem,
  // part of the array after the specified index
  ...arr.slice(index),
];

const sortByCount = (arr) => {
  var result = {
    sortBySender: [],
    sortByReceiver: [],
    sortByTotal: [],
    sortByTxnCount: [],
  };

  result.sortBySender = arr.sort((a, b) => {
    return b.senderCount - a.senderCount;
  });
  result.sortBySender = result.sortBySender.slice(0, 19);

  result.sortByReceiver = arr.sort((a, b) => {
    return b.receiverCount - a.receiverCount;
  });
  result.sortByReceiver = result.sortByReceiver.slice(0, 19);

  result.sortByTotal = arr.sort((a, b) => {
    return b.totalCount - a.totalCount;
  });
  result.sortByTotal = result.sortByTotal.slice(0, 21);

  result.sortByTxnCount = arr.sort((a, b) => {
    return b.txnCount - a.txnCount;
  });
  result.sortByTxnCount = result.sortByTxnCount.slice(0, 19);

  return result;
};

exports.getTokenStat = async (req, res) => {
  var today = new Date();
  const currentTimestamp = Math.round(today.getTime() / 1000);
  const yesterdayTimestamp = currentTimestamp - constants.DAY_IN_SECONDS;
  const lastThreeDaysTimestamp =
    currentTimestamp - 3 * constants.DAY_IN_SECONDS;
  const LastWeekTimestamp = currentTimestamp - constants.WEEK_IN_SECONDS;

  var matchByWeekDuration = {
    $match: {
      timestamp: { $gte: LastWeekTimestamp },
    },
  };

  var matchByThreeDaysDuration = {
    $match: {
      timestamp: { $gte: lastThreeDaysTimestamp },
    },
  };

  var matchByDaysDuration = {
    $match: {
      timestamp: { $gte: yesterdayTimestamp },
    },
  };

  var unwindByHoldingTokens = {
    $unwind: {
      path: "$token.tokenTransfers",
    },
  };

  var groupbyTokensWithUniqueTotals = {
    $group: {
      _id: { tokenAddress: "$to" },
      tokenAddress: { $addToSet: "$to" },
      tokenName: { $addToSet: "$token.name" },
      sender: { $addToSet: "$token.tokenTransfers.from" },
      receiver: { $addToSet: "$token.tokenTransfers.to" },
      txnCount: { $sum: 1 },
    },
  };

  var addSendersAndReceiversWithoutDuplication = {
    $project: {
      tokenAddress: 1,
      tokenName: 1,
      sender: 1,
      receiver: 1,
      txnCount: 1,
      total: { $setUnion: ["$sender", "$receiver"] },
      _id: 0,
      senderCount: { $size: "$sender" },
      receiverCount: { $size: "$receiver" },
    },
  };

  var getTotalCounts = {
    $project: {
      tokenAddress: 1,
      tokenName: 1,
      senderCount: 1,
      receiverCount: 1,
      txnCount: 1,
      totalCount: { $size: "$total" },
    },
  };

  var topTokensByUniqueTotalsBasePipeline = [
    unwindByHoldingTokens,
    groupbyTokensWithUniqueTotals,
    addSendersAndReceiversWithoutDuplication,
    getTotalCounts,
  ];

  var topTokensByUniqueTotalssInWeekPipeline = insert(
    topTokensByUniqueTotalsBasePipeline,
    0,
    matchByWeekDuration
  );

  var topTokensByUniqueTotalssInThreeDaysPipeline = insert(
    topTokensByUniqueTotalsBasePipeline,
    0,
    matchByThreeDaysDuration
  );

  var topTokensByUniqueTotalssInDayPipeline = insert(
    topTokensByUniqueTotalsBasePipeline,
    0,
    matchByDaysDuration
  );

  var uniqueTotalsPipelines = [
    topTokensByUniqueTotalssInWeekPipeline,
    topTokensByUniqueTotalssInThreeDaysPipeline,
    topTokensByUniqueTotalssInDayPipeline,
  ];

  var topTokensByUniqueTotals;
  try {
    topTokensByUniqueTotals = await getAggregateResult(
      Transaction,
      uniqueTotalsPipelines
    );
  } catch (err) {
    res.status(401).json({
      success: false,
      error: err.message,
    });
  }

  res.status(200).json({
    success: true,
    topTokensByUniqueTotals: {
      week: sortByCount(topTokensByUniqueTotals[0]),
      threeDays: sortByCount(topTokensByUniqueTotals[1]),
      day: sortByCount(topTokensByUniqueTotals[2]),
    },
  });
};

const sortNetworkByCountAndGasUsed = (arr) => {
  var result = {
    sortByTxnCount: [],
    sortByGasUsed: [],
  };

  result.sortByTxnCount = arr.sort((a, b) => {
    return b.txnCount - a.txnCount;
  });
  result.sortByTxnCount = result.sortByTxnCount.slice(0, 19);

  result.sortByGasUsed = arr.sort((a, b) => {
    return b.totalGasused - a.totalGasused;
  });
  result.sortByGasUsed = result.sortByGasUsed.slice(0, 19);

  return result;
};

exports.getNetworkStat = async (req, res) => {
  var today = new Date();
  const currentTimestamp = Math.round(today.getTime() / 1000);
  const yesterdayTimestamp = currentTimestamp - constants.DAY_IN_SECONDS;
  const lastThreeDaysTimestamp =
    currentTimestamp - 3 * constants.DAY_IN_SECONDS;
  const LastWeekTimestamp = currentTimestamp - constants.WEEK_IN_SECONDS;

  var matchByWeekDuration = {
    $match: {
      timestamp: { $gte: LastWeekTimestamp },
    },
  };

  var matchByThreeDaysDuration = {
    $match: {
      timestamp: { $gte: lastThreeDaysTimestamp },
    },
  };

  var matchByDaysDuration = {
    $match: {
      timestamp: { $gte: yesterdayTimestamp },
    },
  };

  var filterFromAndToFieldsOnly = {
    $project: { from: 1, to: 1, _id: 0, gasUsed: 1 },
  };
  var concatFromAndToIntoSenderOrReceiver = {
    $set: { senderOrReceiver: { $concatArrays: [["$from"], ["$to"]] } },
  };
  var unwindBySenderOrReceiver = {
    $unwind: { path: "$senderOrReceiver" },
  };
  var groupBySenderOrReceiver = {
    $group: {
      _id: "$senderOrReceiver",
      totalGasused: { $sum: "$gasUsed" },
      txnCount: { $sum: 1 },
    },
  };

  var topAccountsByTxnCountAndGasUsedBasePipeline = [
    filterFromAndToFieldsOnly,
    concatFromAndToIntoSenderOrReceiver,
    unwindBySenderOrReceiver,
    groupBySenderOrReceiver,
  ];

  var topAccountsByTxnCountAndGasUsedWeekPipeline = insert(
    topAccountsByTxnCountAndGasUsedBasePipeline,
    0,
    matchByWeekDuration
  );

  var topAccountsByTxnCountAndGasUsedThreeDaysPipeline = insert(
    topAccountsByTxnCountAndGasUsedBasePipeline,
    0,
    matchByThreeDaysDuration
  );

  var topAccountsByTxnCountAndGasUsedDayPipeline = insert(
    topAccountsByTxnCountAndGasUsedBasePipeline,
    0,
    matchByDaysDuration
  );

  var networkPipelines = [
    topAccountsByTxnCountAndGasUsedWeekPipeline,
    topAccountsByTxnCountAndGasUsedThreeDaysPipeline,
    topAccountsByTxnCountAndGasUsedDayPipeline,
  ];

  var topAccountsByTxnCountAndGasUsed;
  try {
    topAccountsByTxnCountAndGasUsed = await getAggregateResult(
      Transaction,
      networkPipelines
    );
  } catch (err) {
    res.status(401).json({
      success: false,
      error: err.message,
    });
  }

  res.status(200).json({
    success: true,
    topAccountsByTxnCountAndGasUsed: {
      week: sortNetworkByCountAndGasUsed(topAccountsByTxnCountAndGasUsed[0]),
      threeDays: sortNetworkByCountAndGasUsed(
        topAccountsByTxnCountAndGasUsed[1]
      ),
      day: sortNetworkByCountAndGasUsed(topAccountsByTxnCountAndGasUsed[2]),
    },
  });
};

const sortByCount1 = (arr) => {
  var result = {
    sortBySender: [],
    sortByReceiver: [],
    sortByTotal: [],
    sortByTxnCount: [],
  };

  result.sortBySender = arr.sort((a, b) => {
    return b.senderCount - a.senderCount;
  });
  result.sortBySender = result.sortBySender[0];

  result.sortByReceiver = arr.sort((a, b) => {
    return b.receiverCount - a.receiverCount;
  });
  result.sortByReceiver = result.sortByReceiver[0];

  result.sortByTotal = arr.sort((a, b) => {
    return b.totalCount - a.totalCount;
  });
  result.sortByTotal = result.sortByTotal[0];

  result.sortByTxnCount = arr.sort((a, b) => {
    return b.txnCount - a.txnCount;
  });
  result.sortByTxnCount = result.sortByTxnCount[0];

  return result;
};

exports.getTopTXNs = async (req, res) => {
  var today = new Date();
  try {
    const currentTimestamp = Math.round(today.getTime() / 1000);
    const yesterdayTimestamp = currentTimestamp - constants.DAY_IN_SECONDS;
    const threedayTimestamp =
      currentTimestamp - constants.THREE_DAYS_IN_SECONDS;
    const LastWeekTimestamp = currentTimestamp - constants.WEEK_IN_SECONDS;
    const totaltxns = await Transaction.count();
    const totalfromamount = await Transaction.aggregate([
      {
        $group: {
          _id: "",
          count: { $sum: { $toDouble: "$value" } },
        },
      },
    ]);
    var times = [yesterdayTimestamp, threedayTimestamp, LastWeekTimestamp];
    var topValues = [];

    for (let i = 0; i < times.length; i++) {
      let topvalue = await Transaction.aggregate([
        {
          $match: {
            timestamp: { $gte: times[i] },
          },
        },
        {
          $facet: {
            TxnTopsender: [
              {
                $group: {
                  _id: "$from",
                  count: { $sum: { $toDouble: "$value" } },
                },
              },
              { $sort: { count: -1 } },
              { $limit: 20 },
            ],
            TxnTopReceiver: [
              {
                $group: {
                  _id: "$to",
                  count: { $sum: { $toDouble: "$value" } },
                },
              },
              { $sort: { count: -1 } },
              { $limit: 20 },
            ],
            TxnTopSendCount: [
              {
                $group: {
                  _id: "$from",
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
              { $limit: 20 },
            ],
            TxnTopReceiveCount: [
              {
                $group: {
                  _id: "$to",
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
              { $limit: 20 },
            ],
          },
        },
      ]);
      topValues.push(topvalue);
    }

    res.status(200).json({
      success: true,
      topTxnvalues: topValues,
      totaltxns: totaltxns,
      totalZnx: totalfromamount[0]["count"] / Math.pow(10, 18),
    });
  } catch (err) {
    console.log("get detail of ERC20token error" + err);
  }
};

exports.getTopValues = async (req, res) => {
  var today = new Date();
  try {
    const currentTimestamp = Math.round(today.getTime() / 1000);
    const yesterdayTimestamp = currentTimestamp - constants.DAY_IN_SECONDS;
    const threedayTimestamp =
      currentTimestamp - constants.THREE_DAYS_IN_SECONDS;
    const LastWeekTimestamp = currentTimestamp - constants.WEEK_IN_SECONDS;
    var periods = ["daily", "threedays", "weekly"];
    var leftitems = [
      "Top ZNX Sender",
      "Top FTM Receiver",
      "Top Txn Count Sent",
      "Top Txn Count Received",
    ];
    var times = [yesterdayTimestamp, threedayTimestamp, LastWeekTimestamp];
    var topValues = [];
    for (let i = 0; i < times.length; i++) {
      let topvalue = await Transaction.aggregate([
        {
          $match: {
            timestamp: { $gte: times[i] },
          },
        },
        {
          $facet: {
            TxnTopsender: [
              {
                $group: {
                  _id: "$from",
                  total: { $sum: { $toDouble: "$value" } },
                  name: { $addToSet: "txnTopsender" },
                },
              },
              { $sort: { total: -1 } },
              { $limit: 1 },
            ],
            TxnTopReceiver: [
              {
                $group: {
                  _id: "$to",
                  total: { $sum: { $toDouble: "$value" } },
                },
              },
              { $sort: { total: -1 } },
              { $limit: 1 },
            ],
            TxnTopSendCount: [
              {
                $group: {
                  _id: "$from",
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
              { $limit: 1 },
            ],
            TxnTopReceiveCount: [
              {
                $group: {
                  _id: "$to",
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
              { $limit: 1 },
            ],

            TopGas: [
              {
                $group: {
                  _id: "$from",
                  total: { $sum: { $toDouble: "$gasUsed" } },
                },
              },
              { $sort: { total: -1 } },
              { $limit: 1 },
            ],
          },
        },
      ]);
      topValues.push(topvalue);
    }
    const lastThreeDaysTimestamp =
      currentTimestamp - 3 * constants.DAY_IN_SECONDS;

    var matchByWeekDuration = {
      $match: {
        timestamp: { $gte: LastWeekTimestamp },
      },
    };

    var matchByThreeDaysDuration = {
      $match: {
        timestamp: { $gte: lastThreeDaysTimestamp },
      },
    };

    var matchByDaysDuration = {
      $match: {
        timestamp: { $gte: yesterdayTimestamp },
      },
    };

    var unwindByHoldingTokens = {
      $unwind: {
        path: "$token.tokenTransfers",
      },
    };

    var groupbyTokensWithUniqueTotals = {
      $group: {
        _id: { tokenAddress: "$to" },
        tokenAddress: { $addToSet: "$to" },
        tokenName: { $addToSet: "$token.name" },
        sender: { $addToSet: "$token.tokenTransfers.from" },
        receiver: { $addToSet: "$token.tokenTransfers.to" },
        txnCount: { $sum: 1 },
      },
    };

    var addSendersAndReceiversWithoutDuplication = {
      $project: {
        tokenAddress: 1,
        tokenName: 1,
        sender: 1,
        receiver: 1,
        txnCount: 1,
        total: { $setUnion: ["$sender", "$receiver"] },
        _id: 0,
        senderCount: { $size: "$sender" },
        receiverCount: { $size: "$receiver" },
      },
    };

    var getTotalCounts = {
      $project: {
        tokenAddress: 1,
        tokenName: 1,
        senderCount: 1,
        receiverCount: 1,
        txnCount: 1,
        totalCount: { $size: "$total" },
      },
    };

    var topTokensByUniqueTotalsBasePipeline = [
      unwindByHoldingTokens,
      groupbyTokensWithUniqueTotals,
      addSendersAndReceiversWithoutDuplication,
      getTotalCounts,
    ];

    var topTokensByUniqueTotalssInWeekPipeline = insert(
      topTokensByUniqueTotalsBasePipeline,
      0,
      matchByWeekDuration
    );

    var topTokensByUniqueTotalssInThreeDaysPipeline = insert(
      topTokensByUniqueTotalsBasePipeline,
      0,
      matchByThreeDaysDuration
    );

    var topTokensByUniqueTotalssInDayPipeline = insert(
      topTokensByUniqueTotalsBasePipeline,
      0,
      matchByDaysDuration
    );

    var uniqueTotalsPipelines = [
      topTokensByUniqueTotalssInWeekPipeline,
      topTokensByUniqueTotalssInThreeDaysPipeline,
      topTokensByUniqueTotalssInDayPipeline,
    ];

    var topTokensByUniqueTotals;
    try {
      topTokensByUniqueTotals = await getAggregateResult(
        Transaction,
        uniqueTotalsPipelines
      );
    } catch (err) {
      res.status(401).json({
        success: false,
        error: err.message,
      });
    }
    res.status(200).json({
      success: true,
      topvalues: topValues,
      topTokensByUniqueTotals: {
        week: sortByCount1(topTokensByUniqueTotals[0]),
        threeDays: sortByCount1(topTokensByUniqueTotals[1]),
        day: sortByCount1(topTokensByUniqueTotals[2]),
      },
    });
  } catch (err) {
    console.log("get detail of ERC20token error" + err);
  }
};
