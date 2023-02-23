require("dotenv").config();
const Web3 = require("web3");
var async = require("async");
var fs = require("fs");
var mongoose = require("mongoose");

var config = require("../config/mongodb.json");
var { ProcessTransactions, SaveTransaction } = require("./transactions");
var { ProcessAddress, SaveAddress } = require("./address");
var { DoProcessSFC } = require("./sfc");

// Models
const BlockchainStatus = require("../models/BlockchainStatusModel");
const Block = require("../models/BlockModel");

const { constants } = require("../config/constants");
const web3 = new Web3(constants.WEB3_PROVIDER);
// const web3 = new Web3("ws://127.0.0.1:7001");

var date = new Date();
var logStream;
var Service_Delay;

logStream = fs.createWriteStream(
  "log" +
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
    console.log("App is running ... \n");
    console.log("Press CTRL + C to stop the process. \n");

    BlockchainStatus.findOne({ id: "1" }).then((data) => {
      if (!data) {
        let blockChainStatus = new BlockchainStatus({
          id: 1,
          syncno: 0,
          epoch_syncno: 0,
        });
        blockChainStatus.save((data) => {
          console.log("BlockchainStatus table was initialized");
        });
      }
    });

    async.forever(
      function (StartSync) {
        async.waterfall(
          [
            function Init(callback) {
              BlockchainStatus.findOne({ id: 1 })
                .then((data) => {
                  if (data) {
                    console.log("Sync block number -> " + (data.syncno + 1));
                    callback(null, data.syncno + 1, data.epoch_syncno + 1);
                  } else {
                    callback(null, 0);
                  }
                })
                .catch((err) => {
                  callback(err);
                });
            },
            function GetBlockNumber(syncNo, epoch_syncno, callback) {
              web3.eth
                .getBlockNumber()
                .then((blockNumber) => {
                  if (syncNo <= blockNumber) {
                    callback(null, syncNo, epoch_syncno);
                  } else {
                    StartSync();
                  }
                })
                .catch((err) => {
                  console.log(err);
                  callback(err);
                });
            },
            function GetBlock(syncNo, epoch_syncno, callback) {
              web3.eth
                .getBlock(syncNo)
                .then((block) => {
                  Block.updateOne(
                    { number: block.number },
                    block,
                    { upsert: true, setDefaultsOnInsert: true },
                    function (err) {
                      if (err) {
                        callback(err);
                      }
                      callback(null, syncNo, epoch_syncno, block);
                    }
                  );
                })
                .catch((err) => {});
            },
            function GetTransaction(syncNo, epoch_syncno, block, callback) {
              ProcessTransactions(
                web3,
                block.transactions,
                block.timestamp,
                logStream,
                syncNo
              )
                .then((txs) => {
                  //console.log(txs);
                  callback(null, syncNo, epoch_syncno, txs);
                })
                .catch((err) => {
                  console.log(err);
                  callback(err);
                });
            },
            function AddTxsOnDB(syncNo, epoch_syncno, txs, callback) {
              SaveTransaction(txs, logStream)
                .then((data) => {
                  if (data) {
                    callback(null, syncNo, epoch_syncno);
                  } else {
                    console.log("Couldn't save the transaction on MongoDB");
                    callback(
                      new Error("Could not save the transaction on MongoDB")
                    );
                  }
                })
                .catch((err) => {
                  callback(err);
                });
            },
            function GetEpoch(block_syncNo, epoch_syncno, callback) {
              DoProcessSFC(web3, epoch_syncno, logStream)
                .then((data) => {
                  if (data.status) {
                    callback(null, block_syncNo, data.epoch_syncno);
                  } else {
                    console.log("Couldn't get Epoch Information");
                    callback(new Error("Couldn't get Epoch Information"));
                  }
                })
                .catch((err) => {
                  callback(err);
                });
            },
            function FinishProcessingBlock(syncNo, epoch_syncno, callback) {
              BlockchainStatus.updateOne(
                { id: 1 },
                { syncno: syncNo, epoch_syncno: epoch_syncno },
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
            } else {
              StartSync();
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
