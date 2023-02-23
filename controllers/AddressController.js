const Transaction = require("../models/TransactionModel");
const Block = require("../models/BlockModel");
const Account = require("../models/AddressModel");
const Contract = require("../models/ContractModel");
var empty = require("is-empty");

const TokenType = require("../config/tokentype.json");
const AddressType = require("../config/address.json");
const { constants } = require("../config/constants");
const Web3 = require("web3");
var ethers = require("ethers");

var erc20Abi = require("../sync-server/contractABIs/erc20ABI.json");

var web3 = new Web3(constants.WEB3_PROVIDER);
//should be used for web sockeckt provider
var ethersProvider = new ethers.providers.WebSocketProvider(
  constants.WEB3_PROVIDER
);
znxInWei = Math.pow(10, 18);

// should be used for http protocol
// var ethersProvider = new ethers.providers.JsonRpcProvider(
//   constants.WEB3_PROVIDER
// );

const addressInfo = async (req, res) => {
  const address = req.params.address.toLowerCase();
  try {
    const addressInfo = await Account.findOne({ address: address });
    var tabs = [
      constants.ADDRESS_PAGE_TABS.TRANSACTIONS,
      constants.ADDRESS_PAGE_TABS.INTERNAL_TXNS,
    ];
    if (!addressInfo) {
      return res.status(401).json({
        success: false,
        error: "No such address",
      });
    }

    if (addressInfo.type === AddressType.contract) {
      tabs.push(
        constants.ADDRESS_PAGE_TABS.CONTRACT,
        constants.ADDRESS_PAGE_TABS.EVENTS
      );
    }
    if (addressInfo.holdingTokens.length > 0) {
      for (let i = 0; i < addressInfo.holdingTokens.length; i++) {
        if (addressInfo.holdingTokens[i].type === TokenType.erc20) {
          tabs.push(constants.ADDRESS_PAGE_TABS.ERC_20_TOKEN_TXNS);
          break;
        }
      }
      for (let i = 0; i < addressInfo.holdingTokens.length; i++) {
        if (addressInfo.holdingTokens[i].type === TokenType.erc721) {
          tabs.push(constants.ADDRESS_PAGE_TABS.ERC_721_TOKEN_TXNS);
          break;
        }
      }
    }

    const transactionCnt = await Transaction.count({
      $or: [{ from: address }, { to: address }],
    });

    const transactions = await Transaction.find({
      $or: [{ from: address }, { to: address }],
    })
      .lean()
      .sort({ blockNumber: -1 })
      .limit(25);

    tabs.push(
      constants.ADDRESS_PAGE_TABS.ANALYTICS,
      constants.ADDRESS_PAGE_TABS.COMMENTS
    );

    if (addressInfo.type === AddressType.validator) {
      tabs.push(constants.ADDRESS_PAGE_TABS.VALIDATOR_DETAIL);
    }

    res.status(200).json({
      success: true,
      addressInfo: addressInfo,
      txns: transactions,
      transactionCnt: transactionCnt,
      tabs: tabs,
    });
  } catch (err) {
    console.log("get address info error" + err);
    res.status(401).json({
      success: false,
      error: err.message,
    });
  }
};

const getInternalTxns = async (req, res) => {
  const address = req.params.address.toLowerCase();
  try {
    const addressInfo = await Account.findOne({ address: address });

    if (!addressInfo) {
      return res.status(401).json({
        success: false,
        error: "No such address",
      });
    }

    const count = await Transaction.countDocuments({
      $and: [{ input: "0x" }, { $or: [{ from: address }, { to: address }] }],
    });

    const internalTransactions = await Transaction.find({
      $and: [{ input: "0x" }, { $or: [{ from: address }, { to: address }] }],
    })
      .lean()
      .sort({ blockNumber: -1 })
      .limit(25);

    return res.status(200).json({
      success: true,
      internalTransactions: internalTransactions,
      count: count,
    });
  } catch (err) {
    console.log("get address internal txns error" + err);
    res.status(401).json({
      success: false,
      error: err.message,
    });
  }
};

const getErc20Txns = async (req, res) => {
  const address = req.params.address.toLowerCase();
  try {
    const addressInfo = await Account.findOne({ address: address });
    if (!addressInfo) {
      return res.status(401).json({
        success: false,
        error: "No such address",
      });
    }

    const erc20TokenTransactoins = await Transaction.aggregate([
      {
        $match: {
          "token.type": TokenType.erc20,
        },
      },
      {
        $unwind: {
          path: "$token.tokenTransfers",
        },
      },
      {
        $match: {
          $or: [{ from: address }, { to: address }],
        },
      },
      { $sort: { blockNumber: -1 } },
      { $limit: 25 },
    ]);

    return res.status(200).json({
      success: true,
      erc20TokenTransactoins: erc20TokenTransactoins,
      count: erc20TokenTransactoins.length,
    });
  } catch (err) {
    console.log("get address internal txns error" + err);
    res.status(401).json({
      success: false,
      error: err.message,
    });
  }
};

const getErc721Txns = async (req, res) => {
  const address = req.params.address.toLowerCase();
  try {
    const addressInfo = await Account.findOne({ address: address });
    if (!addressInfo) {
      return res.status(401).json({
        success: false,
        error: "No such address",
      });
    }

    const count = await Transaction.countDocuments({
      $and: [
        { "token.type": TokenType.erc721 },
        { $or: [{ from: address }, { to: address }] },
      ],
    });

    // const erc721TokenTransactoins = await Transaction.find({
    //   $and: [
    //     { "token.type": TokenType.erc721 },
    //     {
    //       $or: [{ from: address }, { to: address }],
    //     },
    //   ],
    // })
    //   .lean()
    //   .sort({ blockNumber: -1 })
    //   .limit(25);

    const erc721TokenTransactoins = await Transaction.aggregate([
      {
        $match: {
          "token.type": TokenType.erc721,
        },
      },
      {
        $unwind: {
          path: "$token.tokenTransfers",
        },
      },
      {
        $match: {
          $or: [{ from: address }, { to: address }],
        },
      },
      { $sort: { blockNumber: -1 } },
      { $limit: 25 },
    ]);

    return res.status(200).json({
      success: true,
      erc721TokenTransactoins: erc721TokenTransactoins,
      count: erc721TokenTransactoins.length,
    });
  } catch (err) {
    console.log("get address internal txns error" + err);
    res.status(401).json({
      success: false,
      error: err.message,
    });
  }
};
//get past events using ethers, also works fine but will use web3js

const getEvents = async (req, res) => {
  const address = req.params.address.toLowerCase();
  var filteredEvents = [];
  try {
    const contract = await Contract.findOne({ address: address });

    if (contract.isVerified && "abi" in contract && contract.abi !== null) {
      var abi = JSON.parse(contract.abi);
      let ens = new ethers.Contract(contract.address, abi, ethersProvider);
      let filterAll = {
        address: contract.address,
        fromBlock: ethersProvider.getBlockNumber().then((b) => b - 10000),
        toBlock: "latest",
      };

      // And query:
      ethersProvider.getLogs(filterAll).then(async (logs) => {
        logs.forEach((log) => {
          const data = ens.interface.parseLog(log);
          console.log(data);
          filteredEvents.push({ ...log, data });
        });
        filteredEvents.slice(0, 25);
        for (let i = 0; i < filteredEvents.length; i++) {
          let txn = await Transaction.findOne({
            transactionHash: filteredEvents[i].transactionHash,
          });
          filteredEvents[i] = { ...filteredEvents[i], txn };
        }
        return res.status(200).json({
          success: true,
          events: filteredEvents,
        });
      });
    } else {
      res.status(401).json({
        success: false,
        error: "No contract information",
      });
    }
  } catch (err) {
    console.log("get address info error" + err);
    res.status(401).json({
      success: false,
      error: err.message,
    });
  }
};

const topAccountsByBalance = async (req, res) => {
  const page = parseInt(req.params.page) + 1;
  const rowsPerPage = parseInt(req.params.rowsPerPage);
  const skipIndex = (page - 1) * rowsPerPage;
  var accounts = { docs: [], totalDocs: 0 };
  try {
    //total balance
    var totalBalance = constants.TOTAL_COIN_SUPPLY;

    //get paginated account records
    accounts.docs = await Account.find({
      address: {
        $nin: [
          constants.ZERO_ADDRESS,
          ...constants.VALIDATOR_CONTRACT_ADDRESSES,
        ],
      },
    })
      .lean()
      .skip(skipIndex)
      .sort({ balance: -1 })
      .limit(rowsPerPage);
    accounts.totalDocs = await Account.countDocuments({});

    var accountTxnsCnt = [];
    for (let i = 0; i < accounts.length; i++) {
      accountTxnsCnt[i] = accounts[i].transactionCount["total"];
    }

    res.status(200).json({
      accounts: accounts,
      accountTxnsCnt: accountTxnsCnt,
      totalBalance: totalBalance,
    });
  } catch (err) {
    console.log("get accounts error" + err);
  }
};

const contractInfo = async (req, res) => {
  const address = req.params.address.toLowerCase();
  try {
    const contract = await Contract.findOne({ address: address });
    if (contract) {
      if (contract.isVerified) {
        res.status(200).json({
          success: true,
          contract: contract,
        });
      } else {
        res.status(204).json({
          success: false,
          error: "Not verified",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        error: "No such contract",
      });
    }
  } catch (err) {
    console.log("get address info error" + err);
    res.status(404).json({
      success: false,
      error: err.message,
    });
  }
};

const readContract = async (req, res) => {
  const address = req.params.address.toLowerCase();
  const query = req.body.query;
  try {
    const contract = await Contract.findOne({ address: address });
    if (contract) {
      var readContractResult = [];

      if (contract.isVerified) {
        console.log("abi");
        var abi = JSON.parse(contract.abi);

        if (query !== null && query !== undefined && query !== {}) {
          var queryResult;
          //make web3 query
          if (abi.length > 0) {
            var newContract = new web3.eth.Contract(abi, address);
            for (let i = 0; i < abi.length; i++) {
              var abi_item = abi[i];
              if (!("name" in abi_item)) {
                continue;
              } else {
              }

              var queryParams = [];
              if (abi_item["name"] === query["method_name"]) {
                var queryMethodString = abi_item["name"] + "(";
                for (let j = 0; j < abi_item["inputs"].length; j++) {
                  if (abi_item["inputs"].length === j + 1) {
                    queryMethodString += abi_item["inputs"][j]["type"];
                  } else {
                    queryMethodString += abi_item["inputs"][j]["type"] + ",";
                  }
                  queryParams.push(query[abi_item["inputs"][j]["name"]]);
                }
                queryMethodString += ")";
                queryResult = await newContract.methods[queryMethodString]
                  .apply(this, queryParams)
                  .call();
              }
            }
            return res.status(200).json({
              success: true,
              result: queryResult,
            });
          }
        } else {
          if (abi.length > 0) {
            var newContract = new web3.eth.Contract(abi, address);
            for (let i = 0; i < abi.length; i++) {
              var abi_item = abi[i];
              if (
                "type" in abi_item &&
                abi_item["type"] === "function" &&
                "stateMutability" in abi_item &&
                abi_item["stateMutability"] === "view"
              ) {
                if (abi_item["inputs"].length === 0) {
                  let result;
                  result = await newContract.methods[
                    abi_item["name"] + "()"
                  ]().call();
                  console.log(result);
                  readContractResult.push({
                    method_name: abi_item["name"],
                    method_args: abi_item["inputs"],
                    method_outputs: abi_item["outputs"],

                    method_result: result,
                  });
                } else {
                  readContractResult.push({
                    method_name: abi_item["name"],
                    method_args: abi_item["inputs"],
                    method_outputs: abi_item["outputs"],
                  });
                }
              }
            }
          }
          res.status(200).json({
            success: true,
            result: readContractResult,
          });
        }
      } else {
        res.status(204).json({
          success: false,
          error: "Not verified",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        error: "No such contract",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(401).json({
      success: false,
      error: err.message,
    });
  }
};

const writeContract = async (req, res) => {
  const address = req.params.address.toLowerCase();
  try {
    const contract = await Contract.findOne({ address: address });
    var writeContractResult = [];

    if ("abi" in contract && contract.abi !== null) {
      var abi = JSON.parse(contract.abi);

      if (abi.length > 0) {
        var newContract = new web3.eth.Contract(abi, address);
        for (let i = 0; i < abi.length; i++) {
          var abi_item = abi[i];
          if (
            "type" in abi_item &&
            abi_item["type"] === "function" &&
            "stateMutability" in abi_item &&
            abi_item["stateMutability"] !== "view"
          ) {
            writeContractResult.push({
              method_name: abi_item["name"],
              method_args: abi_item["inputs"],
              method_outputs: abi_item["outputs"],
            });
          }
        }
      }
      res.status(200).json({
        success: true,
        result: writeContractResult,
        abi: abi,
      });
    } else {
      res.status(401).json({
        success: false,
        error: "No contract information",
      });
    }
  } catch (err) {
    res.status(401).json({
      success: false,
      error: err.message,
    });
  }
};

const balanceChecker = async (req, res) => {
  var address = req.body.address.toLowerCase();
  var fromDate = req.body.fromDate;
  var blockNo = req.body.blockNo;

  console.log("blockNo: ", blockNo);
  console.log("fromDate ", fromDate);
  console.log(
    "date to timestamp: ",
    Math.floor(new Date(fromDate).getTime() / 1000)
  );
  try {
    var fromTimestamp = Math.floor(new Date(fromDate).getTime() / 1000);
    if (!web3.utils.isAddress(address)) {
      return res.status(200).json({
        success: false,
        data: {},
        error: "This address is invalid type",
      });
    } else {
      const addressDB = await Account.findOne({ address: address });
      if (empty(addressDB)) {
        return res.status(200).json({
          success: false,
          data: {},
          error: "This address is not seen on the network",
        });
      }

      var relateTxns;
      if (fromTimestamp) {
        relateTxns = await Transaction.find(
          {
            $and: [
              { timestamp: { $lte: fromTimestamp } },
              { $or: [{ from: address }, { to: address }] },
            ],
          },
          {
            _id: 0,
            timestamp: 1,
            from: 1,
            to: 1,
            blockNumber: 1,
            value: 1,
            gas: 1,
            gasPrice: 1,
            gasUsed: 1,
            status: 1,
          }
        )
          .lean()
          .sort({ blockNumber: 1 });
      } else if (blockNo) {
        relateTxns = await Transaction.find(
          {
            $and: [
              { blockNumber: { $lte: blockNo } },
              { $or: [{ from: address }, { to: address }] },
            ],
          },
          {
            _id: 0,
            timestamp: 1,
            from: 1,
            to: 1,
            blockNumber: 1,
            value: 1,
            gas: 1,
            gasPrice: 1,
            gasUsed: 1,
            status: 1,
          }
        )
          .lean()
          .sort({ blockNumber: 1 });
      } else {
        return res.status(200).json({
          success: false,
          data: {},
          error: "Invalid input. No data to display",
        });
      }

      var balanceHistory = [];
      var timestamps = [];
      var balances = [];
      //make balance, timestamp array
      for (let i = 0; i < relateTxns.length; i++) {
        var txn = relateTxns[i];
        if (txn.status === true) {
          console.log(txn);
          console.log(txn.status);
          var balance,
            timestamp = txn.timestamp;
          if (balanceHistory.length === 0) {
            balance = 0;
          } else {
            balance = balanceHistory[balanceHistory.length - 1].balance;
          }

          if (txn.from === address) {
            var txnFee;
            if (txn.gasUsed !== undefined) {
              if (txn.gasUsed > txn.gas) {
                txnFee = txn.gas * txn.gasPrice;
              } else {
                txnFee = txn.gasUsed * txn.gasPrice;
              }
            } else {
              txnFee = txn.gas * txn.gasPrice;
            }
            balance = balance - txnFee - txn.value;
            balances.push(balance);
            timestamps.push(timestamp);
            balanceHistory.push({ balance: balance, timestamp: timestamp });
          } else if (txn.to === address) {
            balance = balance + txn.value;
            balanceHistory.push({
              balance: balance,
              timestamp: timestamp,
            });
            balances.push(balance);
            timestamps.push(timestamp);
          } else {
            console.log("bug txn: ", txn);
          }
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          balanceHistory: balanceHistory,
          timestamps: timestamps,
          balances: balances,
        },
        error: "",
      });
    }
  } catch (err) {
    return res.status(200).json({
      success: false,
      data: {},
      error: err.message,
    });
  }
};

const createDailyBalanceHistory = (balanceHistory) => {
  if (balanceHistory.length === undefined || balanceHistory.length === 0)
    return null;
  var newDayInTimestamp = balanceHistory[0].timestamp;
  let dayInTimestamp = 86400;
  let balanceHistoryByDay = [];

  // const days =
  //   Math.floor(
  //     (balanceHistory[balanceHistory.length - 1] - balanceHistory[0]) /
  //       dayInTimestamp
  //   ) + 1;

  var lastDayStartingIndex = 0;
  var i = 0;

  balanceHistoryByDay.push([
    newDayInTimestamp * 1000,
    balanceHistory[0].balance / znxInWei,
  ]);
  while (i < balanceHistory.length) {
    if (balanceHistory[i].timestamp >= newDayInTimestamp + dayInTimestamp) {
      balanceHistoryByDay.push([
        (newDayInTimestamp + dayInTimestamp) * 1000,
        balanceHistory[i - 1].balance / znxInWei,
      ]);
      newDayInTimestamp += dayInTimestamp;
    }
    lastDayStartingIndex += 1;
    i++;
  }
  if (lastDayStartingIndex < balanceHistory.length) {
    balanceHistoryByDay.push([
      newDayInTimestamp * 1000,
      balanceHistory[balanceHistory - 1].balance / znxInWei,
    ]);
  }
  return balanceHistoryByDay;
};

const createDailyTxnHistory = (txnHistory) => {
  if (txnHistory.length === undefined || txnHistory.length === 0)
    return [txnHistory[0], 1];
  var newDayInTimestamp = txnHistory[0];
  let dayInTimestamp = 86400;
  let txnHistoryByDay = [];

  // const days =
  //   Math.floor(
  //     (txnHistory[txnHistory.length - 1] - txnHistory[0]) /
  //       dayInTimestamp
  //   ) + 1;

  var lastDayStartingIndex = 0;
  var i = 0,
    count = 0;

  txnHistoryByDay.push([newDayInTimestamp * 1000, 1]);

  while (i < txnHistory.length) {
    if (txnHistory[i] >= newDayInTimestamp + dayInTimestamp) {
      txnHistoryByDay.push([
        (newDayInTimestamp + dayInTimestamp) * 1000,
        count,
      ]);
      newDayInTimestamp += dayInTimestamp;
      count = 0;
    }
    lastDayStartingIndex += 1;
    i++;
    count++;
  }
  if (lastDayStartingIndex < txnHistory.length) {
    txnHistoryByDay.push([
      newDayInTimestamp * 1000,
      txnHistory.length - lastDayStartingIndex - 1,
    ]);
  }
  return txnHistoryByDay;
};

const balanceStat = async (req, res) => {
  var address = req.body.address.toLowerCase();

  try {
    if (!web3.utils.isAddress(address)) {
      return res.status(200).json({
        success: false,
        data: {},
        error: "This address is invalid type",
      });
    } else {
      const addressDB = await Account.findOne({ address: address });
      if (empty(addressDB)) {
        return res.status(200).json({
          success: false,
          data: {},
          error: "This address is not seen on the network",
        });
      }

      var relateTxns;
      relateTxns = await Transaction.find(
        {
          $and: [{ $or: [{ from: address }, { to: address }] }],
        },
        {
          _id: 0,
          timestamp: 1,
          from: 1,
          to: 1,
          blockNumber: 1,
          value: 1,
          gas: 1,
          gasPrice: 1,
          gasUsed: 1,
          status: 1,
        }
      )
        .lean()
        .sort({ blockNumber: 1 });

      var balanceHistory = [],
        txnCountsHistory = [];
      //make balance, timestamp array
      for (let i = 0; i < relateTxns.length; i++) {
        var txn = relateTxns[i];
        if (txn.status === true) {
          txnCountsHistory.push(txn.timestamp);
          var balance,
            timestamp = txn.timestamp;
          if (balanceHistory.length === 0) {
            balance = 0;
          } else {
            balance = balanceHistory[balanceHistory.length - 1].balance;
          }

          if (txn.from === address) {
            var txnFee;
            if (txn.gasUsed !== undefined) {
              if (txn.gasUsed > txn.gas) {
                txnFee = txn.gas * txn.gasPrice;
              } else {
                txnFee = txn.gasUsed * txn.gasPrice;
              }
            } else {
              txnFee = txn.gas * txn.gasPrice;
            }
            balance = balance - txnFee - txn.value;
            balanceHistory.push({ balance: balance, timestamp: timestamp });
          } else if (txn.to === address) {
            balance = balance + txn.value;
            balanceHistory.push({
              balance: balance,
              timestamp: timestamp,
            });
          } else {
            console.log("bug txn: ", txn);
          }
        }
      }

      balanceHistory = createDailyBalanceHistory(balanceHistory);
      txnCountsHistory = createDailyTxnHistory(txnCountsHistory);
      return res.status(200).json({
        success: true,
        data: {
          balanceHistory: balanceHistory,
          txnCountsHistory: txnCountsHistory,
          balanceHistoryCount: balanceHistory.length,
          txnCountsHistoryCount: txnCountsHistory.length,
        },
        error: "",
      });
    }
  } catch (err) {
    return res.status(200).json({
      success: false,
      data: {},
      error: err.message,
    });
  }
};

const useIteration = (arr) => {
  const map = [];
  for (let value of arr) {
    if (map.indexOf(value) === -1) {
      map.push(value);
    }
  }

  return map;
};

const createDailyTxnHistoryWithUniqueAddress = (txnHistory, address) => {
  if (txnHistory.length === undefined || txnHistory.length === 0) return null;

  var newDayInTimestamp = txnHistory[0].timestamp;
  let dayInTimestamp = 86400;
  let txnHistoryByDay = [];
  let txnHistoryByDayWithUniqueSenders = [];
  let txnHistoryByDayWithUniqueReceivers = [];

  var lastDayStartingIndex = 0;
  var i = 0,
    count = 0;

  txnHistoryByDay.push([newDayInTimestamp * 1000, 1]);

  var uniqueReceivers = [],
    uniqueSenders = [];

  if (txnHistory[0].from === address && txnHistory[0].to !== null) {
    txnHistoryByDayWithUniqueReceivers.push([newDayInTimestamp * 1000, 1]);
    txnHistoryByDayWithUniqueSenders.push([newDayInTimestamp * 1000, 0]);
  } else {
    txnHistoryByDayWithUniqueReceivers.push([newDayInTimestamp * 1000, 0]);
    txnHistoryByDayWithUniqueSenders.push([newDayInTimestamp * 1000, 1]);
  }

  while (i < txnHistory.length) {
    if (txnHistory[i].timestamp >= newDayInTimestamp + dayInTimestamp) {
      txnHistoryByDay.push([
        (newDayInTimestamp + dayInTimestamp) * 1000,
        count,
      ]);
      txnHistoryByDayWithUniqueSenders.push([
        (newDayInTimestamp + dayInTimestamp) * 1000,
        useIteration(uniqueSenders).length,
      ]);
      txnHistoryByDayWithUniqueReceivers.push([
        (newDayInTimestamp + dayInTimestamp) * 1000,
        useIteration(uniqueReceivers).length,
      ]);
      uniqueReceivers = [];
      uniqueReceivers = [];

      newDayInTimestamp += dayInTimestamp;
      count = 0;
    }
    lastDayStartingIndex += 1;

    if (i !== 0) {
      if (txnHistory[i].from === address && txnHistory[i].to !== null)
        uniqueReceivers.push(txnHistory[i].to);
      else if (txnHistory[i].to === address)
        uniqueSenders.push(txnHistory[i].from);
    }

    i++;
    count++;
  }
  if (lastDayStartingIndex < txnHistory.length) {
    txnHistoryByDay.push([
      newDayInTimestamp * 1000,
      txnHistory.length - lastDayStartingIndex - 1,
    ]);
  }

  return {
    total: txnHistoryByDay,
    uniqueSenders: txnHistoryByDayWithUniqueSenders,
    uniqueReceivers: txnHistoryByDayWithUniqueReceivers,
  };
};

const txnStat = async (req, res) => {
  var address = req.body.address.toLowerCase();

  try {
    if (!web3.utils.isAddress(address)) {
      return res.status(200).json({
        success: false,
        data: {},
        error: "This address is invalid type",
      });
    } else {
      const addressDB = await Account.findOne({ address: address });
      if (empty(addressDB)) {
        return res.status(200).json({
          success: false,
          data: {},
          error: "This address is not seen on the network",
        });
      }

      var relateTxns;
      relateTxns = await Transaction.find(
        {
          $and: [{ $or: [{ from: address }, { to: address }] }],
        },
        {
          _id: 0,
          timestamp: 1,
          from: 1,
          to: 1,
          status: 1,
        }
      )
        .lean()
        .sort({ blockNumber: 1 });

      var txnHistory = [];
      for (let i = 0; i < relateTxns.length; i++) {
        var txn = relateTxns[i];
        if (txn.status === true) {
          txnHistory.push(txn);
        }
      }

      txnHistory = createDailyTxnHistoryWithUniqueAddress(txnHistory, address);

      if (txnHistory) {
        return res.status(200).json({
          success: true,
          data: {
            txnHistoryTotal: txnHistory.total,
            txnHistoryBySender: txnHistory.uniqueSenders,
            txnHistoryByReceiver: txnHistory.uniqueReceivers,
          },
          error: "",
        });
      } else {
        return res.status(200).json({
          success: true,
          data: {
            txnHistoryTotal: [],
            txnHistoryBySender: [],
            txnHistoryByReceiver: [],
          },
          error: "",
        });
      }
    }
  } catch (err) {
    return res.status(200).json({
      success: false,
      data: {},
      error: err.message,
    });
  }
};

const createDailyTxnFeeHistory = (txnHistory, address) => {
  if (txnHistory.length === undefined || txnHistory.length === 0) return null;
  var newDayInTimestamp = txnHistory[0].timestamp;
  let dayInTimestamp = 86400;
  let txnFeeSpent = [];
  let txnFeeUsed = [];

  var lastDayStartingIndex = 0;
  var i = 0,
    feeSpentInDay = 0,
    feeUsedInDay = 0;

  while (i < txnHistory.length) {
    let txn = txnHistory[i];
    if (txn.timestamp >= newDayInTimestamp + dayInTimestamp) {
      txnFeeSpent.push([
        (newDayInTimestamp + dayInTimestamp) * 1000,
        feeSpentInDay / znxInWei,
      ]);
      txnFeeUsed.push([
        (newDayInTimestamp + dayInTimestamp) * 1000,
        feeUsedInDay / znxInWei,
      ]);

      newDayInTimestamp += dayInTimestamp;
      (feeSpentInDay = 0), (feeUsedInDay = 0);
    }
    lastDayStartingIndex += 1;

    if (txn.from === address) {
      if (txn.gasUsed !== undefined) {
        if (txn.gasUsed > txn.gas) {
          feeSpentInDay += txn.gas * txn.gasPrice;
        } else {
          feeSpentInDay += txn.gasUsed * txn.gasPrice;
        }
      } else {
        feeSpentInDay += txn.gas * txn.gasPrice;
      }
    } else {
      feeUsedInDay += txn.gas * txn.gasPrice;
    }
    i++;
  }

  if (lastDayStartingIndex < txnHistory.length) {
    let feeSpentInDay = 0,
      feeUsedInDay = 0;
    for (let i = lastDayStartingIndex; i < txnHistory.length - 1; i++) {
      txn = txnHistory[i];
      if (txn.from === address) {
        if (txn.gasUsed !== undefined) {
          if (txn.gasUsed > txn.gas) {
            feeSpentInDay += txn.gas * txn.gasPrice;
          } else {
            feeSpentInDay += txn.gasUsed * txn.gasPrice;
          }
        } else {
          feeSpentInDay += txn.gas * txn.gasPrice;
        }
      } else {
        feeUsedInDay += txn.gas * txn.gasPrice;
      }
    }

    txnFeeSpent.push([
      (newDayInTimestamp + dayInTimestamp) * 1000,
      feeSpentInDay / znxInWei,
    ]);
    txnFeeUsed.push([
      (newDayInTimestamp + dayInTimestamp) * 1000,
      feeUsedInDay / znxInWei,
    ]);
  }

  return {
    txnFeeUsed: txnFeeUsed,
    txnFeeSpent: txnFeeSpent,
  };
};

const txnFeesStat = async (req, res) => {
  var address = req.body.address.toLowerCase();

  try {
    if (!web3.utils.isAddress(address)) {
      return res.status(200).json({
        success: false,
        data: {},
        error: "This address is invalid type",
      });
    } else {
      const addressDB = await Account.findOne({ address: address });
      if (empty(addressDB)) {
        return res.status(200).json({
          success: false,
          data: {},
          error: "This address is not seen on the network",
        });
      }

      var relateTxns;
      relateTxns = await Transaction.find(
        {
          $and: [{ $or: [{ from: address }, { to: address }] }],
        },
        {
          _id: 0,
          timestamp: 1,
          from: 1,
          to: 1,
          status: 1,
          gas: 1,
          gasUsed: 1,
          gasPrice: 1,
        }
      )
        .lean()
        .sort({ blockNumber: 1 });

      var txnHistory = [];
      for (let i = 0; i < relateTxns.length; i++) {
        var txn = relateTxns[i];
        if (txn.status === true) {
          txnHistory.push(txn);
        }
      }

      txnFeeHistory = createDailyTxnFeeHistory(txnHistory, address);

      if (txnFeeHistory) {
        return res.status(200).json({
          success: true,
          data: {
            txnFeeUsed: txnFeeHistory.txnFeeUsed,
            txnFeeSpent: txnFeeHistory.txnFeeSpent,
          },
          error: "",
        });
      } else {
        return res.status(200).json({
          success: true,
          data: {
            txnFeeUsed: [],
            txnFeeSpent: [],
          },
          error: "",
        });
      }
    }
  } catch (err) {
    return res.status(200).json({
      success: false,
      data: {},
      error: err.message,
    });
  }
};

const createDailyTransfersHistory = (txnHistory, address) => {
  if (txnHistory.length === undefined || txnHistory.length === 0) return null;

  var newDayInTimestamp = txnHistory[0].timestamp;
  let dayInTimestamp = 86400;
  let transfersSent = [];
  let transfersReceived = [];

  var lastDayStartingIndex = 0;
  var i = 0,
    tranfersSentInDay = 0,
    transfersReceivedInDay = 0;

  while (i < txnHistory.length) {
    let txn = txnHistory[i];
    if (txn.timestamp >= newDayInTimestamp + dayInTimestamp) {
      transfersSent.push([
        (newDayInTimestamp + dayInTimestamp) * 1000,
        tranfersSentInDay,
      ]);
      transfersReceived.push([
        (newDayInTimestamp + dayInTimestamp) * 1000,
        transfersReceivedInDay,
      ]);

      newDayInTimestamp += dayInTimestamp;
      (tranfersSentInDay = 0), (transfersReceivedInDay = 0);
    }
    lastDayStartingIndex += 1;

    if (txn.from === address) {
      tranfersSentInDay++;
    } else {
      transfersReceivedInDay++;
    }
    i++;
  }

  if (lastDayStartingIndex < txnHistory.length) {
    let tranfersSentInDay = 0,
      transfersReceivedInDay = 0;
    for (let i = lastDayStartingIndex; i < txnHistory.length - 1; i++) {
      txn = txnHistory[i];
      if (txn.from === address) {
        tranfersSentInDay++;
      } else {
        transfersReceivedInDay++;
      }
    }

    transfersSent.push([
      (newDayInTimestamp + dayInTimestamp) * 1000,
      tranfersSentInDay,
    ]);
    transfersReceived.push([
      (newDayInTimestamp + dayInTimestamp) * 1000,
      transfersReceivedInDay,
    ]);
  }

  return {
    transfersReceived: transfersReceived,
    transfersSent: transfersSent,
  };
};

const createDailytokenTransferHistory = (tokentransfers, address) => {
  if (tokentransfers.length === undefined || tokentransfers.length === 0)
    return null;

  var newDayInTimestamp = tokentransfers[0].timestamp;
  var dayInTimestamp = 86400;
  var totalTokenTransfersCount = [];
  var tokenContractsCount = [];
  var outBoundCount = [];
  var inBoundCount = [];
  var uniqueAddressSent = [];
  var uniqueAddressReceived = [];
  //temporay variables to save daily counts
  var totalTokenTransfersCountInDay = 0;
  var tokenContractsCountInDay = [];
  var outBoundCountInDay = 0;
  var inBoundCountInDay = 0;
  var uniqueAddressSentInDay = [];
  var uniqueAddressReceivedInDay = [];

  var lastDayStartingIndex = 0;
  var i = 0;

  while (i < tokentransfers.length) {
    let txn = tokentransfers[i];
    console.log("txn.timestamp", txn.timestamp);
    console.log("tommorrow", newDayInTimestamp + dayInTimestamp);
    if (txn.timestamp >= newDayInTimestamp + dayInTimestamp) {
      totalTokenTransfersCount.push([
        (newDayInTimestamp + dayInTimestamp) * 1000,
        totalTokenTransfersCountInDay,
      ]);
      tokenContractsCount.push([
        (newDayInTimestamp + dayInTimestamp) * 1000,
        useIteration(tokenContractsCountInDay).length,
      ]);
      outBoundCount.push([
        (newDayInTimestamp + dayInTimestamp) * 1000,
        outBoundCountInDay,
      ]);
      inBoundCount.push([
        (newDayInTimestamp + dayInTimestamp) * 1000,
        inBoundCountInDay,
      ]);
      uniqueAddressSent.push([
        (newDayInTimestamp + dayInTimestamp) * 1000,
        useIteration(uniqueAddressSentInDay).length,
      ]);
      uniqueAddressReceived.push([
        (newDayInTimestamp + dayInTimestamp) * 1000,
        useIteration(uniqueAddressReceivedInDay).length,
      ]);

      newDayInTimestamp += dayInTimestamp;
      //initialize day data for the next day data
      totalTokenTransfersCountInDay = 0;
      tokenContractsCountInDay = [];
      outBoundCountInDay = 0;
      inBoundCountInDay = 0;
      uniqueAddressSentInDay = [];
      uniqueAddressReceivedInDay = [];
    }
    lastDayStartingIndex += 1;

    if (txn.timestamp < newDayInTimestamp + dayInTimestamp) {
      if (txn.from.toLowerCase() === address) {
        outBoundCountInDay++;
        uniqueAddressSentInDay.push(txn.to);
        totalTokenTransfersCountInDay++;
        tokenContractsCountInDay.push(txn.contract);
      } else if (txn.to.toLowerCase() === address) {
        uniqueAddressReceivedInDay.push(txn.from);
        inBoundCountInDay++;
        totalTokenTransfersCountInDay++;
        tokenContractsCountInDay.push(txn.contract);
      }
    }

    i++;
  }

  // data for unfinished last day
  if (lastDayStartingIndex < tokentransfers.length) {
    totalTokenTransfersCount.push([
      (newDayInTimestamp + dayInTimestamp) * 1000,
      totalTokenTransfersCountInDay,
    ]);
    tokenContractsCount.push([
      (newDayInTimestamp + dayInTimestamp) * 1000,
      useIteration(tokenContractsCountInDay).length,
    ]);
    outBoundCount.push([
      (newDayInTimestamp + dayInTimestamp) * 1000,
      outBoundCountInDay,
    ]);
    inBoundCount.push([
      (newDayInTimestamp + dayInTimestamp) * 1000,
      inBoundCountInDay,
    ]);
    uniqueAddressSent.push([
      (newDayInTimestamp + dayInTimestamp) * 1000,
      useIteration(uniqueAddressSentInDay).length,
    ]);
    uniqueAddressReceived.push([
      (newDayInTimestamp + dayInTimestamp) * 1000,
      useIteration(uniqueAddressReceivedInDay).length,
    ]);
  }

  console.log(
    "totalTokenTransfersCountAfterlastDay",
    totalTokenTransfersCount.length
  );

  return {
    totalTokenTransfersCount: totalTokenTransfersCount,
    tokenContractsCount: tokenContractsCount,
    outBoundCount: outBoundCount,
    inBoundCount: inBoundCount,
    uniqueAddressSent: uniqueAddressSent,
    uniqueAddressReceived: uniqueAddressReceived,
  };
};

const transfersStat = async (req, res) => {
  var address = req.body.address.toLowerCase();

  try {
    if (!web3.utils.isAddress(address)) {
      return res.status(200).json({
        success: false,
        data: {},
        error: "This address is invalid type",
      });
    } else {
      const addressDB = await Account.findOne({ address: address });
      if (empty(addressDB)) {
        return res.status(200).json({
          success: false,
          data: {},
          error: "This address is not seen on the network",
        });
      }

      var relateTxns;
      relateTxns = await Transaction.find(
        {
          $and: [{ $or: [{ from: address }, { to: address }] }],
        },
        {
          _id: 0,
          timestamp: 1,
          from: 1,
          to: 1,
          status: 1,
        }
      )
        .lean()
        .sort({ blockNumber: 1 });

      var txnHistory = [];
      for (let i = 0; i < relateTxns.length; i++) {
        var txn = relateTxns[i];
        if (txn.status === true) {
          txnHistory.push(txn);
        }
      }

      transferHistory = createDailyTransfersHistory(txnHistory, address);

      if (transferHistory) {
        return res.status(200).json({
          success: true,
          data: {
            transfersSent: transferHistory.transfersSent,
            transfersReceived: transferHistory.transfersReceived,
          },
          error: "",
        });
      } else {
        return res.status(200).json({
          success: true,
          data: {
            transfersSent: [],
            transfersReceived: [],
          },
          error: "",
        });
      }
    }
  } catch (err) {
    return res.status(200).json({
      success: false,
      data: {},
      error: err.message,
    });
  }
};

const indexOfMax = (arr) => {
  if (arr.length === 0) {
    return -1;
  }

  var max = arr[0];
  var maxIndex = 0;

  for (var i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }
  }

  return maxIndex;
};

const indexOfMin = (a) => {
  if (a.length === 0) {
    return -1;
  }

  var lowest = 0;
  for (var i = 1; i < a.length; i++) {
    if (a[i] < a[lowest]) lowest = i;
  }
  return lowest;
};

const allStat = async (req, res) => {
  var address = req.body.address.toLowerCase();

  try {
    if (!web3.utils.isAddress(address)) {
      return res.status(200).json({
        success: false,
        data: {},
        error: "This address is invalid type",
      });
    } else {
      const addressDB = await Account.findOne({ address: address });
      if (empty(addressDB)) {
        return res.status(200).json({
          success: false,
          data: {},
          error: "This address is not seen on the network",
        });
      }

      var relateTxns;
      relateTxns = await Transaction.find(
        {
          $and: [{ $or: [{ from: address }, { to: address }] }],
        },
        {
          _id: 0,
          timestamp: 1,
          from: 1,
          to: 1,
          status: 1,
          gas: 1,
          gasUsed: 1,
          gasPrice: 1,
          blockNumber: 1,
          value: 1,
        }
      )
        .lean()
        .sort({ blockNumber: 1 });

      var txnHistory = [];
      for (let i = 0; i < relateTxns.length; i++) {
        var txn = relateTxns[i];
        if (txn.status === true) {
          txnHistory.push(txn);
        }
      }

      // balance handling is a little different as it was first created without any further extension
      var balanceHistory = [],
        txnCountsHistory = [],
        balances = [],
        timestamps = [];
      //make balance, timestamp array
      for (let i = 0; i < relateTxns.length; i++) {
        var txn = relateTxns[i];
        if (txn.status === true) {
          txnCountsHistory.push(txn.timestamp);
          var balance,
            timestamp = txn.timestamp;
          if (balanceHistory.length === 0) {
            balance = 0;
          } else {
            balance = balanceHistory[balanceHistory.length - 1].balance;
          }

          if (txn.from === address) {
            var txnFee;
            if (txn.gasUsed !== undefined) {
              if (txn.gasUsed > txn.gas) {
                txnFee = txn.gas * txn.gasPrice;
              } else {
                txnFee = txn.gasUsed * txn.gasPrice;
              }
            } else {
              txnFee = txn.gas * txn.gasPrice;
            }
            balance = balance - txnFee - txn.value;
            balances.push(balance);
            timestamps.push(timestamp);
            balanceHistory.push({ balance: balance, timestamp: timestamp });
          } else if (txn.to === address) {
            balance = balance + txn.value;
            balances.push(balance);
            timestamps.push(timestamp);
            balanceHistory.push({
              balance: balance,
              timestamp: timestamp,
            });
          } else {
            console.log("bug txn: ", txn);
          }
        }
      }

      maxIndex = indexOfMax(balances);
      maxBalance = balances[maxIndex] / znxInWei;
      maxTime = timestamps[maxIndex] * 1000;

      minIndex = indexOfMin(balances);
      minBalance = balances[minIndex] / znxInWei;
      minTime = timestamps[minIndex] * 1000;

      balanceHistory = createDailyBalanceHistory(balanceHistory);
      txnCountsHistory = createDailyTxnHistory(txnCountsHistory);

      // transaction, transfer, txn fee, token transfers handling goes here
      transferHistory = createDailyTransfersHistory(txnHistory, address);
      transactionHisotry = createDailyTxnHistoryWithUniqueAddress(
        txnHistory,
        address
      );
      txnFeeHistory = createDailyTxnFeeHistory(txnHistory, address);
      //for token tranfer history we need to query database with some different way

      const tokentransfers = await Transaction.aggregate([
        {
          $match: {
            $or: [
              { from: address },
              { "token.tokenTransfers.from": address },
              { "token.tokenTransfers.to": address },
            ],
            "token.decodeMethodData.method": "transfer",
            status: true,
          },
        },
        {
          $unwind: {
            path: "$token.tokenTransfers",
          },
        },
        {
          $project: {
            _id: 0,
            contract: "$to",
            from: "$token.tokenTransfers.from",
            to: "$token.tokenTransfers.to",
            token: 1,
            timestamp: 1,
          },
        },
        { $sort: { blockNumber: 1 } },
      ]);

      tokenTransferHistory = createDailytokenTransferHistory(
        tokentransfers,
        address
      );
      // make response depending on each history result
      var response = {};
      if (tokenTransferHistory) {
        response = {
          ...response,
          totalTokenTransfersCount:
            tokenTransferHistory.totalTokenTransfersCount,
          tokenContractsCount: tokenTransferHistory.tokenContractsCount,
          outBoundCount: tokenTransferHistory.outBoundCount,
          inBoundCount: tokenTransferHistory.inBoundCount,
          uniqueAddressSent: tokenTransferHistory.uniqueAddressSent,
          uniqueAddressReceived: tokenTransferHistory.uniqueAddressReceived,
        };
      } else {
        response = {
          ...response,
          totalTokenTransfersCount: [],
          tokenContractsCount: [],
          outBoundCount: [],
          inBoundCount: [],
          uniqueAddressSent: [],
          uniqueAddressReceived: [],
        };
      }
      if (txnFeeHistory) {
        response = {
          ...response,
          txnFeeUsed: txnFeeHistory.txnFeeUsed,
          txnFeeSpent: txnFeeHistory.txnFeeSpent,
        };
      } else {
        response = {
          ...response,
          txnFeeUsed: [],
          txnFeeSpent: [],
        };
      }

      if (transactionHisotry) {
        response = {
          ...response,
          txnHistoryTotal: transactionHisotry.total,
          txnHistoryBySender: transactionHisotry.uniqueSenders,
          txnHistoryByReceiver: transactionHisotry.uniqueReceivers,
        };
      } else {
        response = {
          ...response,
          txnHistoryTotal: [],
          txnHistoryBySender: [],
          txnHistoryByReceiver: [],
        };
      }

      if (transferHistory) {
        response = {
          ...response,
          transfersSent: transferHistory.transfersSent,
          transfersReceived: transferHistory.transfersReceived,
        };
      } else {
        response = {
          ...response,
          transfersSent: [],
          transfersReceived: [],
        };
      }

      if (balanceHistory && txnCountsHistory) {
        response = {
          ...response,
          maxBalance: maxBalance,
          maxTime: maxTime,
          minBalance: minBalance,
          minTime: minTime,
          balanceHistory: balanceHistory,
          txnCountsHistory: txnCountsHistory,
        };
      } else if (balanceHistory) {
        response = {
          ...response,
          maxBalance: maxBalance,
          maxTime: maxTime,
          minBalance: minBalance,
          minTime: minTime,
          balanceHistory: balanceHistory,
          txnCountsHistory: [],
        };
      } else if (txnCountsHistory) {
        response = {
          ...response,
          balanceHistory: [],
          txnCountsHistory: txnCountsHistory,
        };
      } else {
        response = {
          ...response,
          balanceHistory: [],
          txnCountsHistory: [],
        };
      }

      return res.status(200).json({
        success: true,
        data: response,
        error: "",
      });
    }
  } catch (err) {
    return res.status(200).json({
      success: false,
      data: {},
      error: err.message,
    });
  }
};

module.exports = {
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
};
