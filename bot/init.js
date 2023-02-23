const { SendRawTransaction } = require("./app/SendRawTransaction");
const Web3 = require("web3");
const ArgParams = require("./app/config/ArgParams");
const { CreateRandomAccounts } = require("./app/CreateRandomAccounts");
const fs = require("fs");

var accoutInfoFile = __dirname + "/AccountGroups.json";
var logDirPath = __dirname + "/logs";
var provider = ArgParams.WEB3_PROVIDER;
const web3 = new Web3(provider);

// create bulk accounts for startup
var { group1, group2 } = CreateRandomAccounts(web3);

var date = new Date();
var balanceHistory;

balanceHistory = fs.createWriteStream(
  logDirPath +
    "/balance_of_ bot_accounts" +
    "_" +
    date.getFullYear().toString() +
    "_" +
    (date.getMonth() + 1).toString() +
    "_" +
    date.getDate().toString() +
    ".log",
  { flags: "a" }
);

var accountGroups = {};
try {
  var jsonString = fs.readFileSync(accoutInfoFile, "utf8");
  console.log(jsonString);
  var accountGroups = JSON.parse(jsonString);
  var newAccountGroups = {};
  newAccountGroups.group1 = [...group1, ...accountGroups.group1];
  newAccountGroups.group2 = [...group2, ...accountGroups.group2];

  console.log(newAccountGroups);
} catch (err) {
  var newAccountGroups = {};
  newAccountGroups.group1 = group1;
  newAccountGroups.group2 = group2;
  console.log(newAccountGroups);
  fs.writeFileSync(
    accoutInfoFile,
    JSON.stringify({ group1: group1, group2: group2 }, null, "\t"),
    function (err) {
      if (err) {
        console.log("Failed to save created accounts");
        throw err;
      } else {
        console.log("Success to save created accounts");
      }
    }
  );
  console.log(err);
}

fs.writeFileSync(
  accoutInfoFile,
  JSON.stringify(newAccountGroups, null, "\t"),
  function (err) {
    if (err) {
      console.log("Failed to save created accounts");
      throw err;
    } else {
      console.log("Success to save created accounts");
    }
  }
);

var nonce;
const addressFrom = ArgParams.STARTER_ACCOUNT;
const valueInEther = ArgParams.STARTUP_DISTRIBUTE_VALUE;
const privateKey = ArgParams.STARTER_ACCOUNT_KEY;
web3.eth.getTransactionCount(addressFrom, "pending").then((txnCount) => {
  nonce = txnCount;
  newAccountGroups.group1.forEach((receiver) => {
    SendRawTransaction(web3, receiver.address, nonce, valueInEther, privateKey);
    nonce++;
  });
});

function SaveBalaneOnLogFile(accounts, balanceHistory) {
  accounts.forEach((account) => {
    web3.eth.getBalance(account.address, function (err, result) {
      if (err) {
        console.log("-".repeat(100));
        console.log(err);
        console.log("-".repeat(100));
      } else {
        console.log(account.address + ": ", web3.utils.fromWei(result) + "OPR");
        balanceHistory.write(
          new Date().toString() +
            "\t" +
            "address: " +
            account.address +
            "," +
            web3.utils.fromWei(result) +
            "OPR" +
            "\n"
        );
      }
    });
  });
}

balanceHistory.write("=".repeat(50));
balanceHistory.write(new Date().toString());
balanceHistory.write("=".repeat(50) + "\n");
SaveBalaneOnLogFile(newAccountGroups.group1, balanceHistory);
SaveBalaneOnLogFile(newAccountGroups.group1, balanceHistory);
