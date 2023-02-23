const Web3 = require("web3");

const web3 = new Web3("http://52.74.43.98");

web3.eth
  .getBlockNumber()
  .then((blockNumber) => {
    console.log("Current block number in Zilionixx mainnet is ", blockNumber);
  })
  .catch((err) => {
    console.log(err);
  });
