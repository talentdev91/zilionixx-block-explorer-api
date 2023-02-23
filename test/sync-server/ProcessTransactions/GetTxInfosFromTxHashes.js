// const bep20ABI = require("../../../sync-server/contractABIs/bep20ABI.json");
const bep20ABI = require("../../../sync-server/contractABIs/erc20ABI.json");
const InputDataDecoder = require("ethereum-input-data-decoder");
const decoder = new InputDataDecoder(bep20ABI);
const { isEmpty } = require("../utils/utils");

const ProcessTransactionsWithForStat = async function (web3, txs, logStream) {
  console.log("Loading... Getting transactions using for statement...");
  var txInfos = [];
  var txInfo;
  var txReceipt;
  var tokendetail;
  var txsLength = txs.length;
  for (var i = 0; i < txs.length; i++) {
    try {
      txInfo = await web3.eth.getTransaction(txs[i]);
      if (txInfo.input !== "0x") {
        try {
          var decodeResult = decoder.decodeData(txInfo.input);
          var contract = new web3.eth.Contract(bep20ABI, txInfo.to);
          const decimals = await contract.methods.decimals().call();
          var tokenName = await contract.methods.name().call();

          tokendetail = {
            token: {
              name: tokenName,
              type: "BEP20",
              method: decodeResult.method,
              recipient: "0X" + decodeResult.inputs[0],
              amount: decodeResult.inputs[1].toString(),
              decimals: decimals,
            },
          };
        } catch (err) {
          console.log("Decode Data failed");
        }
      }

      txReceipt = await web3.eth.getTransactionReceipt(txs[i]);
      txInfos.push({ ...txInfo, ...txReceipt });
    } catch (err) {
      txInfos.push({ ...txInfo, status: false });
      console.log("fail");
    }
  }

  process.exit();
};

const ProcessTransactionsWithBatchRequest = async function (
  web3,
  txs,
  logStream
) {
  var txInfos = [];
  var txInfo, txReceipt, tokenDetail, tx;
  var getTxInfoAndReceiptPromises = [];
  const txsLength = txs.length;
  console.log("Loading... Getting transactions with promises request...");

  for (var i = 0; i < txsLength; i++) {
    try {
      getTxInfoAndReceiptPromises.push(web3.eth.getTransaction(txs[i]));
      getTxInfoAndReceiptPromises.push(web3.eth.getTransactionReceipt(txs[i]));
    } catch (err) {
      console.log(err);
    }
  }

  const txPromises = await Promise.all(getTxInfoAndReceiptPromises);
  console.log(txPromises.length);
  for (let i = 0; i < txsLength; i++) {
    txInfo = txPromises[2 * i];
    txReceipt = txPromises[2 * i + 1];
    if (!isEmpty(txReceipt)) {
      tx = { ...txInfo, status: false };
      //   txInfos.push({ ...txInfo, status: false });
    } else {
      tx = { ...txInfo, ...txReceipt };
      //   txInfos.push({ ...txInfo, ...txReceipt });
    }
    if (txInfo.input !== "0x") {
      try {
        var decodeResult = decoder.decodeData(txInfo.input);
        var contract = new web3.eth.Contract(bep20ABI, txInfo.to);
        const decimals = await contract.methods.decimals().call();
        var tokenName = await contract.methods.name().call();

        tokenDetail = {
          token: {
            name: tokenName,
            type: "BEP20",
            method: decodeResult.method,
            recipient: "0X" + decodeResult.inputs[0],
            amount: decodeResult.inputs[1].toString(),
            decimals: decimals,
          },
        };
        txInfos.push({ ...tx, ...tokenDetail });
      } catch (err) {
        console.log("Decode Data failed");
        txInfos.push({ ...tx });
      }
    }
  }

  process.exit();
};

module.exports = {
  ProcessTransactionsWithForStat,
  ProcessTransactionsWithBatchRequest,
};
