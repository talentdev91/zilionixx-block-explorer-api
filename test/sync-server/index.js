const Web3 = require("web3");
const fs = require("fs");
var mongoose = require("mongoose");
var config = require("../../config/mongodb.json");

const { constants } = require("../../config/constants");

const {
  ProcessTransactionsWithForStat,
  ProcessTransactionsWithBatchRequest,
} = require("./ProcessTransactions/GetTxInfosFromTxHashes");
const {
  SaveTransactionWithForStmt,
  SaveTransactionWithBulkWrite,
} = require("./ProcessTransactions/SaveTransactions");
const logDirPath = __dirname + "/logs";
const web3 = new Web3(constants.WEB3_PROVIDER);
const testDataFilePath = __dirname + "/TestData_TokenTxns.json";
const testTransactionFilePath = __dirname + "/TestData_Transactions-1000.json";
const date = new Date();
var testLogStream, transactionUpdateOnDBLogStream;

testLogStream = fs.createWriteStream(
  logDirPath +
    "/get_transactions_performance_test" +
    "_" +
    date.getFullYear().toString() +
    "_" +
    (date.getMonth() + 1).toString() +
    "_" +
    date.getDate().toString() +
    ".log",
  { flags: "a" }
);

transactionUpdateOnDBLogStream = fs.createWriteStream(
  logDirPath +
    "/update_db_performance_test" +
    "_" +
    date.getFullYear().toString() +
    "_" +
    (date.getMonth() + 1).toString() +
    "_" +
    date.getDate().toString() +
    ".log",
  { flags: "a" }
);

//uncomment this to test performance-test for web3 get transaction async

// const jsonString = fs.readFileSync(testDataFilePath, "utf8");
// const testData = JSON.parse(jsonString);
// const txs = testData.transactionHash;

// ProcessTransactionsWithForStat(web3, txs, testLogStream);
// ProcessTransactionsWithBatchRequest(web3, txs, testLogStream);

var mongoDB =
  "mongodb://" + config.database.host + "/" + config.database.database;

mongoose
  .connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    const jsonTxObjString = fs.readFileSync(testTransactionFilePath, "utf8");
    const TxObjs = JSON.parse(jsonTxObjString);
    console.log(TxObjs.length);
    // const txs = testData.transactionHash;

    SaveTransactionWithForStmt(TxObjs, transactionUpdateOnDBLogStream);
    // SaveTransactionWithBulkWrite(TxObjs, transactionUpdateOnDBLogStream);
  })
  .catch((err) => {
    console.log("MongoDB connection ERROR!");
  });
