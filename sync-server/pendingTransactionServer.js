require("dotenv").config();
const Web3 = require("web3");
var mongoose = require("mongoose");
var config = require("../config/mongodb.json");

const { constants } = require("../config/constants");
const web3 = new Web3(constants.WEB3_PROVIDER);
const PendingTransaction = require("../models/PendingTransactionModel");

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

    var pendingTransactionSubscription = web3.eth.subscribe(
      "pendingTransactions",
      function (error, result) {
        if (error) console.log(error);
      }
    );
    pendingTransactionSubscription.on("data", function (transactionHash) {
      web3.eth
        .getTransaction(transactionHash)
        .then(async function (transaction) {
          console.log(transactionHash);
          console.log(transaction);
          try {
            await PendingTransaction.updateOne(
              { hash: transaction.hash },
              transaction,
              {
                upsert: true,
                setDefaultsOnInsert: true,
              }
            );
            console.log("fghj");
          } catch (error) {
            console.log(error);
            GetPendingTransaction();
          }
        });
    });
  })
  .catch((err) => {
    console.log("MongoDB connection ERROR!");
  });
