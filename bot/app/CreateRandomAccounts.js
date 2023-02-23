const ArgParams = require("./config/ArgParams");

const CreateRandomAccounts = function (web3) {
  var group1 = [];
  var group2 = [];
  for (var i = 0; i < ArgParams.COUNT_OF_ACCOUNT; i++) {
    group1.push(web3.eth.accounts.create(web3.utils.randomHex(32)));
    group2.push(web3.eth.accounts.create(web3.utils.randomHex(32)));
  }
  return { group1, group2 };
};

module.exports = { CreateRandomAccounts };
