var ethers = require("ethers");

const PendingTransaction = require("../models/PendingTransactionModel");
const Transaction = require("../models/TransactionModel");
const Block = require("../models/BlockModel");
const Token = require("../models/TokenModel");
const erc20ABI = require("./contractABIs/erc20ABI.json");
const erc721ABI = require("./contractABIs/erc721ABI.json");
const InputDataDecoder = require("ethereum-input-data-decoder");
const decoder = new InputDataDecoder(erc20ABI);
const decoderERC721 = new InputDataDecoder(erc721ABI);

const TokenType = require("../config/tokentype.json");
const { ProcessAddress } = require("./address");

const SaveTransaction = async function (txs, logStream) {
  var updateOps = [];
  var delPendingTxnOps = [];
  const txsLength = txs.length;
  if (txsLength === 0) {
    return true;
  }
  for (var i = 0; i < txsLength; i++) {
    try {
      var updateOp = {
        updateOne: {
          filter: { hash: txs[i].hash },
          update: txs[i],
          upsert: true,
        },
      };
      updateOps.push(updateOp);
      var delPendingTxnOp = {
        deleteOne: {
          filter: { hash: txs[i].hash },
        },
      };
      delPendingTxnOps.push(delPendingTxnOp);
    } catch (err) {
      return false;
    }
  }

  var txsOnDB = Transaction.bulkWrite(
    updateOps,
    { ordered: false },
    (err, result) => {
      if (err) {
        console.log("Bulkwriting txns failed ", err);
        logStream.write(
          new Date().toString() + "Bulkwriting txns failed: " + err + "\n"
        );
      }
    }
  );

  PendingTransaction.bulkWrite(
    delPendingTxnOps,
    { ordered: false },
    (err, result) => {
      if (err) {
        console.log("Bulkwriting pending txns failed ", err);
        logStream.write(
          new Date().toString() +
            "Bulkwriting pending txns failed: " +
            err +
            "\n"
        );
      }
    }
  );
  return true;
};

const ProcessAsERC20Tx = async function (web3, tx, token) {
  var decodeResult;
  try {
    decodeResult = await decoder.decodeData(tx.input);
    // distinguish if constructor or not
    if (decodeResult.method !== null) {
      for (let i = 0; i < decodeResult.types.length; i++) {
        if (decodeResult.types[i] === "uint256") {
          decodeResult.inputs[i] = decodeResult.inputs[i].toString();
        }
      }
      tokenDetail = {
        token: {
          name: token.name,
          type: token.type,
          decimals: token.decimals,
          symbol: token.symbol,
          decodeMethodData: decodeResult,
          tokenTransfers: [],
        },
      };
    } else {
      tokenDetail = {
        token: {
          name: token.name,
          type: token.type,
          decimals: token.decimals,
          symbol: token.symbol,
          decodeMethodData: null,
          tokenTransfers: [],
        },
      };
    }
    var iface = new ethers.utils.Interface(erc20ABI);
    var logs = tx.logs;

    for (let i = 0; i < logs.length; i++) {
      var data = logs[i].data;
      var topics = logs[i].topics;
      var parsedLog = iface.parseLog({ data, topics });
      if (parsedLog.name === "Transfer") {
        var args = parsedLog.args;
        var token = await Token.findOne({
          address: logs[i].address,
        }).lean();

        tokenDetail.token.tokenTransfers.push({
          from: args[0],
          to: args[1],
          value: args[2].toString(),
        });
      }
    }

    return tokenDetail;
  } catch (err) {
    return null;
  }
};

const ProcessAsERC721Tx = async function (web3, tx, token) {
  var decodeResult;
  try {
    decodeResult = await decoderERC721.decodeData(tx.input);

    if (decodeResult.method !== null) {
      for (let i = 0; i < decodeResult.types.length; i++) {
        if (decodeResult.types[i] === "uint256") {
          decodeResult.inputs[i] = decodeResult.inputs[i].toString();
        }
      }
      tokenDetail = {
        token: {
          name: token.name,
          type: token.type,
          symbol: token.symbol,
          decodeMethodData: decodeResult,
          tokenTransfers: [],
        },
      };
    } else {
      tokenDetail = {
        token: {
          name: token.name,
          type: token.type,
          symbol: token.symbol,
          decodeMethodData: null,
          tokenTransfers: [],
        },
      };
    }
    var iface = new ethers.utils.Interface(erc721ABI);
    var logs = tx.logs;

    for (let i = 0; i < logs.length; i++) {
      var data = logs[i].data;
      var topics = logs[i].topics;
      var parsedLog = iface.parseLog({ data, topics });
      if (parsedLog.name === "Transfer") {
        var args = parsedLog.args;
        var token = await Token.findOne({
          address: logs[i].address,
        }).lean();

        tokenDetail.token.tokenTransfers.push({
          from: args[0],
          to: args[1],
          value: args[2].toString(),
        });
      }
    }

    return tokenDetail;
  } catch (err) {
    return null;
  }
};

const ProcessTransactions = async function (
  web3,
  txs,
  timestamp,
  logStream,
  blockNumber
) {
  var txInfos = [];
  var txInfo, txReceipt, tokenDetail, tx;
  var getTxInfoAndReceiptPromises = [];
  var txsLength = txs.length;
  var blockReward = 0;

  console.log("blockNumber in Process Txns: ", blockNumber);
  console.log("Transaction count in block is: " + txsLength.toString());

  for (var i = 0; i < txsLength; i++) {
    try {
      getTxInfoAndReceiptPromises.push(web3.eth.getTransaction(txs[i]));
      getTxInfoAndReceiptPromises.push(web3.eth.getTransactionReceipt(txs[i]));
    } catch (err) {
      console.log(err);
    }
  }

  const txPromises = await Promise.all(getTxInfoAndReceiptPromises);
  for (let i = 0; i < txsLength; i++) {
    txInfo = txPromises[2 * i];
    txReceipt = txPromises[2 * i + 1];
    if (txReceipt === null || txReceipt === undefined || txReceipt === {}) {
      tx = { ...txInfo, status: false, timestamp: timestamp };
    } else {
      tx = { ...txInfo, ...txReceipt, timestamp: timestamp };
      //calcuate blockreward
      if (tx.gasUsed) {
        reward = tx.gasUsed * parseInt(tx.gasPrice);
      } else {
        reward = tx.gas * parseInt(tx.gasPrice);
      }
      blockReward += reward;
    }

    console.log("Block reward for blockNo ", blockNumber, " is ", blockReward);
    if (tx.input !== "0x") {
      try {
        var token = await Token.findOne({ address: tx.to });
        var tokenDetail;
        if (token.type === TokenType.erc20) {
          tokenDetail = await ProcessAsERC20Tx(web3, tx, token);
        } else if (token.type === TokenType.erc721) {
          tokenDetail = await ProcessAsERC721Tx(web3, tx, token);
        }

        console.log("Returned token detail: --->>>", tokenDetail);
        txInfos.push({ ...tx, ...tokenDetail });
      } catch (err) {
        console.log("Decode Data failed");
        txInfos.push({ ...tx });
      }
    } else {
      txInfos.push(tx);
    }

    // Get address info from Txn and Save
    ProcessAddress(web3, { ...tx, ...tokenDetail }, logStream);
  }

  Block.updateOne(
    { number: blockNumber },
    { blockReward: blockReward },
    { upsert: true, setDefaultsOnInsert: true },
    function (err) {
      if (err) {
        console.log(err);
      } else {
      }
    }
  );
  return txInfos;
};

module.exports = { ProcessTransactions, SaveTransaction };
