const { SendRawTransaction } = require("./app/SendRawTransaction");
const Web3 = require("web3");
const ArgParams = require("./app/config/ArgParams");
const fs = require("fs");
var async = require("async");

var filepath = __dirname + "/AccountGroups.json";
var provider = ArgParams.WEB3_PROVIDER;
const web3 = new Web3(provider);

var nonce = [];
var group1ToGroup2 = ArgParams.DIRECTION;

async.waterfall(
  [ReadAccountGroups, SendBulkTransactions],
  function (err, result) {
    console.log(err);
  }
);
function ReadAccountGroups(callback) {
  var accountGroups = {};
  var senders = [];
  var receivers = [];

  try {
    var jsonString = fs.readFileSync(filepath, "utf8");
    var accountGroups = JSON.parse(jsonString);
  } catch (err) {
    console.log(err);

    callback(err);
  }
  if (group1ToGroup2 === "12") {
    senders = accountGroups.group1;
    receivers = accountGroups.group2;
  } else {
    senders = accountGroups.group2;
    receivers = accountGroups.group1;
  }
  callback(null, senders, receivers);
}
function SendBulkTransactions(senders, receivers, callback) {
  senders.forEach((sender) => {
    var addressFrom = sender.address;
    var valueInEther = ArgParams.VALUE_IN_ETHER;
    web3.eth.getTransactionCount(addressFrom, "pending").then((txnCount) => {
      nonce = txnCount;
      privateKey = sender.privateKey.slice(2);

      receivers.forEach((receiver) => {
        SendRawTransaction(
          web3,
          receiver.address,
          nonce,
          valueInEther,
          privateKey
        );
        nonce++;
      });
    });
  });
  callback(null);
}
