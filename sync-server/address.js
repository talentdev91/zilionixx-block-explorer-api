const Address = require("../models/AddressModel");
const Token = require("../models/TokenModel");
const Contract = require("../models/ContractModel");
const erc20ABI = require("./contractABIs/erc20ABI.json");
const erc721ABI = require("./contractABIs/erc721ABI.json");

var { SaveToken } = require("./token");
const AddressType = require("../config/address.json");
const TokenType = require("../config/tokentype.json");

const ProcessAddress = async function (web3, txn, logStream) {
  if (txn.contractAddress) {
    try {
      await SaveAddress([
        { address: txn.contractAddress, type: AddressType.contract },
      ]);
    } catch (err) {}
    //save as smart contract
    try {
      const newContract = await Contract.updateOne(
        { address: txn.contractAddress.toLocaleLowerCase() },
        {
          address: txn.contractAddress.toLocaleLowerCase(),
          creationCode: txn.input,
        },
        {
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );
    } catch (err) {
      logStream.write(new Date().toString() + "\t" + err + "\n");
      console.log(err);
    }
    //save as token
    var token;
    try {
      var contract = new web3.eth.Contract(erc20ABI, txn.contractAddress);
      const decimals = await contract.methods.decimals().call();
      var tokenName = await contract.methods.name().call();
      var tokenSymbol = await contract.methods.symbol().call();
      var totalSupply = await contract.methods.totalSupply().call();

      if (tokenName && tokenSymbol && decimals) {
        token = {
          type: TokenType.erc20,
          address: txn.contractAddress.toLocaleLowerCase(),
          symbol: tokenSymbol,
          name: tokenName,
          decimals: decimals,
          totalSupply: totalSupply,
          logo: "token logo",
        };
        SaveToken(token);

        //save in address collection with token type wallet and holding tokens
        let addrInfos = [];
        let balance = await web3.eth.getBalance(txn.from);
        let tokenBalance = await contract.methods.balanceOf(txn.from).call();
        let holdingTokens = {
          type: token.type,
          decimals: token.decimals,
          address: txn.contractAddress.toLocaleLowerCase(),
          symbol: tokenSymbol,
          name: tokenName,
          balance: tokenBalance,
          sendOrReceive: "send",
        };
        let addr = {
          type: AddressType.account,
          balance: balance,
          address: txn.from.toLocaleLowerCase(),
          sendOrReceive: "send",
          holdingTokens: holdingTokens,
        };

        addrInfos.push(addr);
        await SaveAddress(addrInfos, logStream);
      }
    } catch (err) {
      console.log(err);
    }
    if (token === null || token === undefined || token === {}) {
      try {
        var contract = new web3.eth.Contract(erc721ABI, txn.contractAddress);
        var tokenName = await contract.methods.name().call();
        var tokenSymbol = await contract.methods.symbol().call();
        var totalSupply = await contract.methods.totalSupply().call();

        if (tokenName && tokenSymbol) {
          var token = {
            type: TokenType.erc721,
            address: txn.contractAddress,
            symbol: tokenSymbol,
            name: tokenName,
            totalSupply: totalSupply,
            logo: "token logo",
          };
          SaveToken(token);

          //save in address collection with token type wallet and holding tokens
          let addrInfos = [];
          let balance = await web3.eth.getBalance(txn.from);
          let tokenBalance = await contract.methods.balanceOf(txn.from).call();
          let holdingTokens = {
            type: token.type,
            address: txn.contractAddress.toLocaleLowerCase(),
            symbol: tokenSymbol,
            name: tokenName,
            balance: tokenBalance,
            sendOrReceive: "send",
          };
          let addr = {
            type: AddressType.account,
            balance: balance,
            address: txn.from.toLocaleLowerCase(),
            sendOrReceive: "send",

            holdingTokens: holdingTokens,
          };

          addrInfos.push(addr);
          await SaveAddress(addrInfos, logStream);
        }
      } catch (err) {
        console.log(err);
      }
    }
  } else {
    try {
      if (txn.input === "0x") {
        let addrInfos = [];
        let balanceOfFromAddress = await web3.eth.getBalance(txn.from);
        let balanceOfToAddress = await web3.eth.getBalance(txn.to);
        let fromAddress = {
          type: AddressType.account,
          balance: balanceOfFromAddress,
          address: txn.from.toLocaleLowerCase(),
          sendOrReceive: "send",
        };
        let toAddress = {
          type: AddressType.account,
          balance: balanceOfToAddress,
          address: txn.to.toLocaleLowerCase(),
          sendOrReceive: "receive",
        };
        addrInfos.push(fromAddress, toAddress);
        await SaveAddress(addrInfos, logStream);
      } else {
        try {
          // In this case to address is contract address so no need to save it
          let addrInfos = [];
          const getAccountAddrInfo = async (addr, tokenType, sendOrReceive) => {
            let balance = await web3.eth.getBalance(addr);
            var contract,
              decimals = null;
            if (tokenType === TokenType.erc20) {
              contract = new web3.eth.Contract(erc20ABI, txn.to);
              decimals = await contract.methods.decimals().call();
            } else {
              contract = new web3.eth.Contract(erc721ABI, txn.to);
            }

            let tokenBalance = await contract.methods.balanceOf(addr).call();
            var tokenName = await contract.methods.name().call();
            var tokenSymbol = await contract.methods.symbol().call();

            let holdingTokens = {
              type: tokenType,
              decimals: decimals,
              address: txn.to.toLocaleLowerCase(),
              symbol: tokenSymbol,
              name: tokenName,
              balance: tokenBalance,
              sendOrReceive: sendOrReceive,
            };
            let addrInfo = {
              type: AddressType.account,
              balance: balance,
              address: addr.toLocaleLowerCase(),
              sendOrReceive: sendOrReceive,
              holdingTokens: holdingTokens,
            };
            return addrInfo;
          };
          if (txn.token && txn.token.type) {
            let balance = await web3.eth.getBalance(txn.to);

            let addrInfo = {
              type: AddressType.contract,
              balance: balance,
              address: txn.to.toLocaleLowerCase(),
              sendOrReceive: "receive",
            };
            if (addrInfo) addrInfos.push(addrInfo);
          }

          if (txn.token && txn.token.tokenTransfers.length > 0) {
            for (let i = 0; i < txn.token.tokenTransfers.length; i++) {
              let fromAddrInfo = await getAccountAddrInfo(
                txn.token.tokenTransfers[i].from,
                txn.token.type,
                "send"
              );
              let toAddrInfo = await getAccountAddrInfo(
                txn.token.tokenTransfers[i].to,
                txn.token.type,
                "receive"
              );
              if (fromAddrInfo) addrInfos.push(fromAddrInfo);
              if (toAddrInfo) addrInfos.push(toAddrInfo);
            }
          } else {
            let addrInfos = [];
            let balanceOfFromAddress = await web3.eth.getBalance(txn.from);
            let balanceOfToAddress = await web3.eth.getBalance(txn.to);
            let fromAddress = {
              type: AddressType.account,
              balance: balanceOfFromAddress,
              address: txn.from.toLocaleLowerCase(),
              sendOrReceive: "send",
            };
            let toAddress = {
              type: AddressType.account,
              balance: balanceOfToAddress,
              address: txn.to.toLocaleLowerCase(),
              sendOrReceive: "receive",
            };
            addrInfos.push(fromAddress, toAddress);
            await SaveAddress(addrInfos, logStream);
          }
          await SaveAddress(addrInfos, logStream);
        } catch (err) {
          console.log(err);
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
};
const SaveAddress = async function (addrInfos, logStream) {
  var addrInfoes = addrInfos;
  for (var i = 0; i < addrInfoes.length; i++) {
    var addr = await Address.findOne({ address: addrInfoes[i].address });
    var txnSendCount = 0,
      txnReceiveCount = 0,
      txnTotalCount = 1;

    try {
      if (addr) {
        txnTotalCount = addr.transactionCount.total + 1;

        if (addrInfoes[i].sendOrReceive === "send") {
          txnSendCount = addr.transactionCount.send + 1;
          txnReceiveCount = addr.transactionCount.receive;
        }

        if (addrInfoes[i].sendOrReceive === "receive") {
          txnSendCount = addr.transactionCount.send;
          txnReceiveCount = addr.transactionCount.receive + 1;
        }

        addrInfoes[i].transactionCount = {
          send: txnSendCount,
          receive: txnReceiveCount,
          total: txnTotalCount,
        };
      }
    } catch (err) {
      console.log(err);
    }

    if (addr && addr.holdingTokens && addrInfoes[i].holdingTokens) {
      var holdingTokens = addr.holdingTokens;
      var isExist = false;
      try {
        for (var j = 0; j < holdingTokens.length; j++) {
          if (holdingTokens[j].address === addrInfos[i].holdingTokens.address) {
            isExist = true;

            var update = { $set: {} };
            update["$set"]["holdingTokens." + j] = holdingTokens[j];
            update["$set"]["transactionCount"] = addrInfoes[i].transactionCount;
            if (addrInfos[i].holdingTokens.sendOrReceive === "send") {
              addrInfos[i].holdingTokens.sendCount = addr.holdingTokens[j]
                .sendCount
                ? addr.holdingTokens[j].sendCount++
                : 1;
            } else {
              addrInfos[i].holdingTokens.receiveCount = addr.holdingTokens[j]
                .receiveCount
                ? addr.holdingTokens[j].receiveCount++
                : 1;
            }

            delete addrInfos[i].holdingTokens.sendOrReceive;

            await Address.updateOne(
              {
                $and: [
                  { address: addrInfoes[i].address },
                  { "holdingTokens.address": holdingTokens[j].address },
                ],
              },
              update
            );
            break;
          }
        }

        if (!isExist) {
          if (addrInfos[i].holdingTokens.sendOrReceive === "send") {
            addrInfos[i].holdingTokens.sendCount = 1;
          } else {
            addrInfos[i].holdingTokens.receiveCount = 1;
          }

          delete addrInfos[i].holdingTokens.sendOrReceive;

          holdingTokens.push(addrInfos[i].holdingTokens);
          addrInfoes[i].holdingTokens = holdingTokens;

          await Address.updateOne(
            {
              $and: [{ address: addrInfoes[i].address }],
            },
            {
              ...addrInfoes[i],
            },
            {
              upsert: true,
              setDefaultsOnInsert: true,
            }
          );
        }
      } catch (err) {}
    } else {
      if (addrInfoes[i].holdingTokens) {
        if (addrInfos[i].holdingTokens.sendOrReceive === "send") {
          addrInfos[i].holdingTokens.sendCount = 1;
        } else {
          addrInfos[i].holdingTokens.receiveCount = 1;
        }
        delete addrInfos[i].holdingTokens.sendOrReceive;
      }
      try {
        await Address.updateOne(
          { address: addrInfoes[i].address },
          {
            ...addrInfoes[i],
          },
          {
            upsert: true,
            setDefaultsOnInsert: true,
          }
        );
      } catch (err) {
        return false;
      }
    }
  }

  return true;
};

module.exports = { SaveAddress, ProcessAddress };
