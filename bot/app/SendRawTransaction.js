const ethTx = require("ethereumjs-tx").Transaction;
const Common = require("ethereumjs-common").default;
const ArgParams = require("./config/ArgParams");
const fs = require("fs");

var logDirPath = __dirname + "/../logs";
var date = new Date();

logStream = fs.createWriteStream(
  logDirPath +
    "/log_of_bulk_transactions" +
    "_" +
    date.getFullYear().toString() +
    "_" +
    (date.getMonth() + 1).toString() +
    "_" +
    date.getDate().toString() +
    ".log",
  { flags: "a" }
);

const customCommon = Common.forCustomChain(
  ArgParams.CUSTOM_CHAIN.MAINNET,
  {
    name: ArgParams.CUSTOM_CHAIN.NAME,
    chainId: ArgParams.CUSTOM_CHAIN.CHAIN_ID,
  },
  ArgParams.CUSTOM_CHAIN.HARDFORK
);

const SendRawTransaction = function (
  web3,
  addressTo,
  nonce,
  value,
  privateKey
) {
  web3.transactionConfirmationBlocks =
    ArgParams.TRANSACTION_CONFIRMATION_BLOCKS;
  const privKey = Buffer.from(privateKey, "hex");
  const valueInEther = value;

  var txObject = {
    nonce: web3.utils.numberToHex(nonce),
    gasPrice: web3.utils.numberToHex(ArgParams.GAS_PRICE),
    gasLimit: web3.utils.numberToHex(ArgParams.GAS_LIMIT),
    to: addressTo,
    value: web3.utils.numberToHex(
      web3.utils.toWei(valueInEther.toString(), "ether")
    ),
  };

  console.log(txObject);
  logStream.write(JSON.stringify(txObject, null, "\t") + "\n");
  // Sign the transaction with the private key
  var tx = new ethTx(txObject, { common: customCommon });
  tx.sign(privKey);

  //Convert to raw transaction string
  var serializedTx = tx.serialize();
  var rawTxHex = "0x" + serializedTx.toString("hex");

  web3.eth
    .sendSignedTransaction(rawTxHex)
    .on("receipt", (receipt) => {
      console.log("Receipt: ", receipt);
      logStream.write(JSON.stringify(receipt, null, "\t") + "\n");
    })
    .catch((error) => {
      console.log("Error: ", error.message);
      logStream.write("=".repeat(50) + "Error" + "=".repeat(50));
      logStream.write(error.message);
      logStream.write("=".repeat(100));
    });
};

module.exports = { SendRawTransaction };
