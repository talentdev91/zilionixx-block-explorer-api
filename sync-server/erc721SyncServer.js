require("dotenv").config();
const Web3 = require("web3");
var async = require("async");
var fs = require("fs");
var mongoose = require("mongoose");

var config = require("../config/mongodb.json");

// Models
const BlockchainStatus = require("../models/BlockchainStatusModel");
const SyncDaemonsStatus = require("../models/SyncDaemonsStatusModel");

const Block = require("../models/BlockModel");
const Transaction = require("../models/TransactionModel");
const Address = require("../models/AddressModel");

const { constants } = require("../config/constants");
const tokenType = require("../config/tokentype.json");
const web3 = new Web3(constants.WEB3_PROVIDER);
// const web3 = new Web3("ws://127.0.0.1:7001");

var date = new Date();
var logStream;
var Service_Delay;

logStream = fs.createWriteStream(
  "log_erc721_inventory" +
    "_" +
    date.getFullYear().toString() +
    "_" +
    (date.getMonth() + 1).toString() +
    "_" +
    date.getDate().toString() +
    ".log",
  { flags: "a" }
);

var mongoDB =
  "mongodb://" +
  process.env.MONGODB_URL +
  ":" +
  process.env.MONGODB_PORT +
  "/" +
  process.env.MONGODB_DATABASE;

mongoose
  .connect(mongoDB, {
    // user: process.env.MONGODB_USER,
    // pass: process.env.MONGODB_PASSWORD,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to %s", mongoDB);
    console.log("ERC721 inventory sync server is running ... \n");
    console.log("Press CTRL + C to stop the process. \n");

    var erc721SyncStatus;
    SyncDaemonsStatus.findOne({ id: "1" }).then((data) => {
      if (!data) {
        erc721SyncStatus = new SyncDaemonsStatus({
          id: 1,
          syncType: constants.SYNC_TYPES.ERC721_INVENTORY,
          syncBlockNo: 0,
        });
        erc721SyncStatus.save((data) => {
          console.log("ERC 721 inventory sync status record is added");
        });
      } else {
        erc721SyncStatus = data;
      }
    });

    async.forever(
      function (StartSync) {
        async.waterfall(
          [
            function InitErc721(callback) {
              SyncDaemonsStatus.findOne({
                syncType: constants.SYNC_TYPES.ERC721_INVENTORY,
              })
                .then((data) => {
                  if (data) {
                    console.log(
                      "ERC721 sync server: current sync block number  -> " +
                        data.syncBlockNo
                    );
                    callback(null, data.syncBlockNo);
                  }
                })
                .catch((err) => {
                  callback(err);
                });
            },
            function GetMainSyncNo(erc721SyncNo, callback) {
              var cur_syncno = 0;
              BlockchainStatus.findOne({ id: 1 })
                .then((data) => {
                  if (data) {
                    if (erc721SyncNo < data.syncno) {
                      cur_syncno = erc721SyncNo;
                    } else {
                      cur_syncno = data.syncno;
                    }
                    callback(null, cur_syncno);
                  } else {
                    callback(null, 0);
                  }
                })
                .catch((err) => {
                  callback(err);
                });
            },
            function GetTransactionCountInBlock(blockNo, callback) {
              Block.findOne({ number: blockNo })
                .then((block) => {
                  if (
                    block &&
                    block.transactions &&
                    block.transactions.length > 0
                  ) {
                    callback(null, blockNo, block.transactions.length);
                  } else {
                    callback(null, blockNo, 0);
                  }
                })
                .catch((err) => {
                  callback(err);
                });
            },
            function GetTransactionsFromBlockNo(blockNo, txnCount, callback) {
              Transaction.find({ blockNumber: blockNo })
                .then((txns) => {
                  if (txns && txns.length === txnCount) {
                    callback(null, txns, blockNo);
                  } else {
                    callback(null, [], blockNo);
                  }
                })
                .catch((err) => {
                  console.log(err);
                  callback(err);
                });
            },
            function ProcessTxnsForErc721Transfers(txns, blockNo, callback) {
              for (let i = 0; i < txns.length; i++) {
                let txn = txns[i];
                if (txn.token !== undefined) {
                  if (
                    txn.token.type !== undefined &&
                    txn.token.type === tokenType.erc721 &&
                    txn.token.tokenTransfers !== undefined
                  ) {
                    if (txn.token.tokenTransfers.length > 0) {
                      for (
                        let j = 0;
                        j < txn.token.tokenTransfers.length;
                        j++
                      ) {
                        let tokenTransfer = txn.token.tokenTransfers[j];
                        let fromAddress = tokenTransfer.from;
                        let toAddress = tokenTransfer.to;
                        let tokenId = tokenTransfer.value;
                        let contractAddress = txn.to;
                        console.log("tokenTransfer", tokenTransfer);

                        Address.findOne({ address: toAddress }, {})
                          .then((data) => {
                            let oldAddress = data;
                            var newAddress = oldAddress;

                            console.log("oldAddress", oldAddress);

                            if (oldAddress.holdingTokens !== undefined) {
                              var isExist = false;
                              for (
                                let j = 0;
                                j < oldAddress.holdingTokens.length;
                                j++
                              ) {
                                if (
                                  oldAddress.holdingTokens[j].address ===
                                    contractAddress &&
                                  oldAddress.holdingTokens[j].tokenIds !==
                                    undefined
                                ) {
                                  if (
                                    !(
                                      tokenId in
                                      oldAddress.holdingTokens[j].tokenIds
                                    )
                                  ) {
                                    newAddress.holdingTokens[j].tokenIds.push(
                                      tokenId
                                    );
                                  }

                                  isExist = true;
                                } else if (
                                  oldAddress.holdingTokens[j].address ===
                                    contractAddress &&
                                  oldAddress.holdingTokens[j].tokenIds ===
                                    undefined
                                ) {
                                  newAddress.holdingTokens[j].tokenIds = [
                                    tokenId,
                                  ];
                                }

                                if (isExist) break;
                              }

                              if (!isExist) {
                                newAddress.holdingTokens.push({
                                  address: contractAddress,
                                  type: tokenType.erc721,
                                  name: txn.token.name,
                                  symbol: txn.token.symbol,
                                  tokenIds: [tokenId],
                                });
                              }
                            } else {
                              newAddress.holdingTokens = {
                                address: contractAddress,
                                tokenIds: [tokenId],
                              };
                            }
                            console.log("newAddress", newAddress);

                            Address.updateOne(
                              { address: toAddress },
                              newAddress,
                              {
                                upsert: true,
                                setDefaultsOnInsert: true,
                              }
                            )
                              .then((data) => {})
                              .catch((err) => {
                                console.log(err);
                                callback(err);
                              });
                          })
                          .catch((err) => {
                            console.log(err);
                            let newAddress = {
                              address: toAddress,
                              holdingTokens: {
                                tokenIds: [tokenId],
                              },
                            };
                            Address.updateOne({}, newAddress, {
                              upsert: true,
                              setDefaultsOnInsert: true,
                            })
                              .then((data) => {})
                              .catch((err) => {
                                console.log(err);
                                callback(err);
                              });
                          });

                        Address.updateOne(
                          {
                            address: fromAddress,
                            "holdingTokens.address": contractAddress,
                          },
                          { $pull: { "holdingTokens.$.tokenIds": tokenId } },
                          function (err) {
                            if (err) {
                              console.log(err);

                              callback(err);
                            }
                          }
                        );
                      }
                    }
                  }
                } else if (txns.length === 0) {
                  callback(null, blockNo);
                }
              }
              callback(null, blockNo);
            },
            function UpdateErc721BlockNoAndFinish(blockNo, callback) {
              SyncDaemonsStatus.updateOne(
                {
                  syncType: constants.SYNC_TYPES.ERC721_INVENTORY,
                },
                { syncBlockNo: blockNo + 1 },
                { upsert: true, setDefaultsOnInsert: true },
                function (err) {
                  if (err) {
                    callback(err);
                  }
                  callback(null);
                }
              );
            },
          ],
          function (err) {
            if (err) {
              return StartSync(err);
            } else {
              return StartSync();
            }
          }
        );
      },
      function (error) {
        logStream.write(new Date().toString() + "\t" + error + "\n");
        console.log(error);
      }
    );
  })
  .catch((err) => {
    console.log("MongoDB connection ERROR!");
  });
