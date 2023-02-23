const Web3 = require("web3");
const { EVM } = require("evm");
const arrayBufferToHex = require("array-buffer-to-hex");

//import models
const Transaction = require("../models/TransactionModel");
const Block = require("../models/BlockModel");
const Account = require("../models/AddressModel");
const Contract = require("../models/ContractModel");

const { constants } = require("../config/constants");
const { isNotEmpty } = require("../helpers/utility");
const { areAddressesValid } = require("./utils/utils");

var web3 = new Web3(constants.WEB3_PROVIDER);
const erc20ABI = require("../sync-server/contractABIs/erc20ABI.json");

exports.broadcastTx = async (req, res) => {
  try {
    const rawTxHex = req.body.params.rawTxHex.replace(/\s/g, "");
    web3.eth
      .sendSignedTransaction(rawTxHex)
      .on("receipt", function (receipt) {
        console.log(receipt);
        res.status(200).json({ txReceipt: receipt });
      })
      .on("error", function (error) {
        res.status(401).json({ message: error.message });
      });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

exports.byteToOpcode = async (req, res) => {
  try {
    const bytecode = req.body.params.bytecode.replace(/\s/g, "");
    const evm = new EVM(bytecode);
    const opcodes = evm.getOpcodes();
    var opcodesWithHexPushData = [];
    for (let i = 0; i < opcodes.length; i++) {
      if (opcodes[i].pushData) {
        opcodesWithHexPushData.push({
          name: opcodes[i].name,
          pushData: "0x" + arrayBufferToHex(opcodes[i].pushData),
        });
      } else {
        opcodesWithHexPushData.push({
          name: opcodes[i].name,
        });
      }
    }

    res.status(200).json({ decodeData: opcodesWithHexPushData });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

exports.publicApis = async (req, res) => {
  try {
    const action = req.query.action;
    if (action === constants.APIS.ACTION_TYPES.BALANCE) {
      if (
        !isNotEmpty(req.query.address) ||
        !web3.utils.isAddress(req.query.address)
      ) {
        res.status(401).json({ message: "Missing address or invalid address" });
      } else {
        const address = req.query.address;
        const balance = await Account.findOne(
          { address: address },
          { _id: 0, balance: 1 }
        ).lean();
        res.status(200).json({ data: balance });
      }
    } else if (action === constants.APIS.ACTION_TYPES.BALANCE_MULTI) {
      if (
        !isNotEmpty(req.query.address) ||
        !areAddressesValid(web3, req.query.address.split(","))
      ) {
        res
          .status(401)
          .json({ message: "Missing addresses or invalid addresses" });
      } else {
        const addresses = req.query.address.split(",");
        const balanceInAddresses = await Account.find(
          {
            address: { $in: addresses },
          },
          { _id: 0, address: 1, balance: 1 }
        ).lean();

        res.status(200).json({ data: balanceInAddresses });
      }
    } else if (action === constants.APIS.ACTION_TYPES.TX_LIST) {
      if (
        !isNotEmpty(req.query.address) ||
        !web3.utils.isAddress(req.query.address)
      ) {
        res.status(401).json({ message: "Missing address or invalid address" });
      } else {
        var txListLimitNumber = constants.APIS.TX_LIMIT_NUMBER;
        const address = req.query.address;
        var sort = req.query.sort === constants.APIS.SORT_TYPES.DEC ? -1 : 1;
        const startblock = req.query.startblock ? req.query.startblock : 1;
        const lastblock = await Block.findOne({}, { _id: 0, number: 1 }).sort({
          timestamp: -1,
        });
        const endblock = req.query.endblock
          ? req.query.endblock
          : lastblock.number;
        console.log(startblock);
        console.log(lastblock);
        var txCount = await Transaction.count();
        console.log(typeof txCount);
        console.log(typeof txListLimitNumber);
        var txs;
        if (req.query.page && req.query.offset) {
          var query = {
            blockNumber: {
              $gte: startblock,
              $lte: endblock,
            },
            $or: [{ from: { $eq: address } }, { to: address }],
          };
          var options = {
            sort: { timestamp: sort },
            lean: true,
            page: req.query.page,
            limit: req.query.offset,
          };
          txs = await Transaction.paginate(query, options);
          res.status(200).json({ data: { txs, count: txs.docs.length } });
        } else {
          txs = await Transaction.find(
            {
              blockNumber: {
                $gte: startblock,
                $lte: endblock,
              },
              $or: [{ from: { $eq: address } }, { to: address }],
            },
            { _id: 0 }
          )
            .limit(txListLimitNumber)
            .sort({ timestamp: sort });
          res.status(200).json({ data: { txs, count: txs.length } });
        }
      }
    } else if (action === constants.APIS.ACTION_TYPES.TOKEN_TX) {
      if (
        !isNotEmpty(req.query.address) ||
        !web3.utils.isAddress(req.query.address)
      ) {
        res.status(401).json({ message: "Missing address or invalid address" });
      } else {
        var txListLimitNumber = constants.APIS.TX_LIMIT_NUMBER;
        var sort = req.query.sort === constants.APIS.SORT_TYPES.DEC ? -1 : 1;

        var addressToTopic1 = web3.utils.padLeft(req.query.address, 64);
        var erc20TransferTxns;
        var pipeline;
        if (!req.query.contractAddress) {
          pipeline = [
            {
              $match: {
                $and: [
                  {
                    "logs.topics.0": constants.ERC20_TOKEN_TRANSFER_KECCAK,
                  },
                  {
                    "logs.topics.1": addressToTopic1,
                  },
                ],
              },
            },
            {
              $unset: [
                "logs.id",
                "logs.removed",
                "logs.logIndex",
                "logs.transactionIndex",
                "logs.blockHash",
              ],
            },
            {
              $project: {
                _id: 0,
                timestamp: 1,
                logs: {
                  $filter: {
                    input: "$logs",
                    as: "log",
                    cond: {
                      $and: [
                        {
                          $eq: [
                            {
                              $arrayElemAt: ["$$log.topics", 0],
                            },
                            constants.ERC20_TOKEN_TRANSFER_KECCAK,
                          ],
                        },
                        {
                          $eq: [
                            {
                              $arrayElemAt: ["$$log.topics", 1],
                            },
                            addressToTopic1,
                          ],
                        },
                      ],
                    },
                  },
                },
              },
            },
          ];
          if (req.query.page && req.query.offset) {
            const page = parseInt(req.query.page);
            const offset = parseInt(req.query.offset);
            erc20TransferTxns = await Transaction.aggregate(pipeline)
              .skip(page)
              .limit(offset);
            res.status(200).json({ data: { erc20TransferTxns } });
          } else {
            erc20TransferTxns = await Transaction.aggregate(pipeline);
            res.status(200).json({ data: { erc20TransferTxns } });
          }
        } else {
          const contractAddress = req.query.contractAddress;
          pipeline = [
            {
              $match: {
                $and: [
                  { "logs.address": contractAddress },
                  {
                    "logs.topics.0": constants.ERC20_TOKEN_TRANSFER_KECCAK,
                  },
                  {
                    "logs.topics.1": addressToTopic1,
                  },
                ],
              },
            },
            {
              $unset: [
                "logs.id",
                "logs.removed",
                "logs.logIndex",
                "logs.transactionIndex",
                "logs.blockHash",
              ],
            },
            {
              $project: {
                _id: 0,
                timestamp: 1,
                logs: {
                  $filter: {
                    input: "$logs",
                    as: "log",
                    cond: {
                      $and: [
                        {
                          $eq: ["$$log.address", contractAddress],
                        },
                        {
                          $eq: [
                            {
                              $arrayElemAt: ["$$log.topics", 0],
                            },
                            constants.ERC20_TOKEN_TRANSFER_KECCAK,
                          ],
                        },
                        {
                          $eq: [
                            {
                              $arrayElemAt: ["$$log.topics", 1],
                            },
                            addressToTopic1,
                          ],
                        },
                      ],
                    },
                  },
                },
              },
            },
          ];
          if (req.query.page && req.query.offset) {
            const page = parseInt(req.query.page);
            const offset = parseInt(req.query.offset);
            erc20TransferTxns = await Transaction.aggregate(pipeline)
              .skip(page)
              .limit(offset);
            res.status(200).json({ data: { erc20TransferTxns } });
          } else {
            erc20TransferTxns = await Transaction.aggregate(pipeline);
            res.status(200).json({ data: { erc20TransferTxns } });
          }
        }
      }
    } else if (action === constants.APIS.ACTION_TYPES.TOKEN_NFT_TX) {
      const address = req.query.address;
      const contractAddress = req.query.contractaddress;

      if (address != null && typeof contractAddress === "undefined") {
        if (!web3.utils.isAddress(address)) {
          res
            .status(401)
            .json({ message: "Missing address or invalid address" });
        } else {
          //Get a list of "ERC721 - Token Transfer Events" by Address
          // [Optional Parameters] startblock: starting blockNo to retrieve results, endblock: ending blockNo to retrieve results
          var txListLimitNumber = constants.APIS.TX_LIMIT_NUMBER;

          var sort = req.query.sort === constants.APIS.SORT_TYPES.DEC ? -1 : 1;

          var txCount = await Transaction.count();
          var txs;

          const startblock = req.query.startblock ? req.query.startblock : 1;
          const endblock = req.query.endblock
            ? req.query.endblock
            : lastblock.number;
          txs = await Transaction.find(
            {
              blockNumber: {
                $gte: startblock,
                $lte: endblock,
              },
              $or: [{ from: { $eq: address } }, { to: address }],
              "token.type": "ERC721",
            },
            { _id: 0 }
          )
            .limit(txListLimitNumber)
            .sort({ timestamp: sort });
          res.status(200).json({ data: { txs, count: txs.length } });
        }
      } else if (contractAddress != null && typeof address === "undefined") {
        //(To get paginated results use page=<page number> and offset=<max records to return>)
        if (!web3.utils.isAddress(contractAddress)) {
          res.status(401).json({
            message: "Missing contract address or invalid contract address",
          });
        } else {
          var sort = req.query.sort === constants.APIS.SORT_TYPES.DEC ? -1 : 1;
          var txCount = await Transaction.count();
          var txs;
          var query = {
            to: contractAddress,
            "token.type": "ERC721",
          };
          var options = {
            sort: { timestamp: sort },
            lean: true,
            page: req.query.page,
            limit: req.query.offset,
          };
          txs = await Transaction.paginate(query, options);
          res.status(200).json({ data: { txs, count: txs.docs.length } });
        }
      } else {
        if (
          !web3.utils.isAddress(contractAddress) ||
          !web3.utils.isAddress(address)
        ) {
          res.status(401).json({
            message:
              "Missing contract address or invalid contract address(address)",
          });
        } else {
          var sort = req.query.sort === constants.APIS.SORT_TYPES.DEC ? -1 : 1;
          var txCount = await Transaction.count();
          var txs;
          var query = {
            from: address,
            to: contractAddress,
            "token.type": "ERC721",
          };
          var options = {
            sort: { timestamp: sort },
            lean: true,
            page: req.query.page,
            limit: req.query.offset,
          };
          txs = await Transaction.paginate(query, options);
          res.status(200).json({ data: { txs, count: txs.docs.length } });
        }
      }
    } else if (action === constants.APIS.ACTION_TYPES.TOKEN_SUPPLY) {
      if (
        !isNotEmpty(req.query.contractaddress) ||
        !web3.utils.isAddress(req.query.contractaddress)
      ) {
        res.status(401).json({
          message: "Missing contract address or invalid contract address",
        });
      } else {
        const contractAddress = req.query.contractaddress;
        let contract = new web3.eth.Contract(erc20ABI, contractAddress);
        const totalSupply = await contract.methods.totalSupply().call();
        res.status(200).json({ data: { result: totalSupply } });
      }
    } else if (action === constants.APIS.ACTION_TYPES.TOKEN_BALANCE) {
      const contractAddress = req.query.contractaddress;
      const accountAddress = req.query.address;
      let contract = new web3.eth.Contract(erc20ABI, contractAddress);
      const balanceOf = await contract.methods
        .balanceOf(accountAddress.toLowerCase())
        .call();
      const balance = web3.utils.fromWei(balanceOf);
      res.status(200).json({ data: { result: balance } });
    } else if (action === constants.APIS.ACTION_TYPES.GET_ABI) {
      const address = req.query.address;
      const abi = await Contract.find({ address: address }, { abi: 1 });
      res.status(200).json({ state: "1", ABI: abi });
    } else {
      if (
        !isNotEmpty(req.query.address) ||
        !web3.utils.isAddress(req.query.address)
      ) {
        res.status(401).json({ message: "Missing address or invalid address" });
      } else {
        const address = req.query.address;
        var blockListLimit = constants.APIS.BLOCK_LIMIT_NUMBER;
        var sort = req.query.sort === constants.APIS.SORT_TYPES.DEC ? -1 : 1;
        var blocks;
        if (req.query.page && req.query.offset) {
          var page = parseInt(req.query.page);
          var offset = parseInt(req.query.offset);
          const skipIndex = (page - 1) * offset;
          blocks = await Block.find({
            miner: address,
          })

            .sort({ timestamp: sort })
            .skip(skipIndex)
            .limit(offset)
            .lean();
          res.status(200).json({ data: { blocks, count: blocks.length } });
        } else {
          console.log("miner: " + address);
          blocks = await Block.find({
            miner: address,
          })
            .limit(blockListLimit)
            .sort({ timestamp: sort })
            .lean();
          res.status(200).json({ data: { blocks, count: blocks.length } });
        }
      }
    }
  } catch (err) {
    console.log(err.message);
    res.status(401).json({ error: err.message });
  }
};
