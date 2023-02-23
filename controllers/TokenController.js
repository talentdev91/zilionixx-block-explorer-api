const BlockchainStatus = require("../models/BlockchainStatusModel");
const Token = require("../models/TokenModel");
const TokenInfo = require("../models/TokenInfoModel");

const Transaction = require("../models/TransactionModel");
const Block = require("../models/BlockModel");
const Account = require("../models/AddressModel");
const tokentype = require("../config/tokentype.json");

const Web3 = require("web3");
var empty = require("is-empty");

const { constants } = require("../config/constants");
const web3 = new Web3(constants.WEB3_PROVIDER);
const ABI = require("../sync-server/contractABIs/erc20ABI.json");
const erc721ABI = require("../sync-server/contractABIs/erc721ABI.json");

const getTotalSupply = async(tokenAddress, decimals, type) => {  
  var resultSupply = await Account.aggregate([
    {
      $unwind: "$holdingTokens"
    },
    {
      $match: {
        "holdingTokens.address": { $eq: tokenAddress },
      },
    },
    {
      $project: {tokenAddress: "$holdingTokens.address", tokenBalance: {$toDecimal: "$holdingTokens.balance"}}
    },
    {
      $group: {_id: "$tokenAddress", totalSupply: {$sum: "$tokenBalance"}}
    }
  ])
 
  var result = resultSupply[0].totalSupply
  if(result) {
    if(type === tokentype.erc20)
      return parseInt(result.toString()) / Math.pow(10, decimals)
    else
      return parseInt(result.toString())
  } else {
    return 0
  }
}

exports.createTokenInfo = async (req, res) => {
  new TokenInfo({
    email: req.body.email,
    name: req.body.name,
    contract: req.body.contract,
    official: req.body.official,
    logo: req.body.logo,
    description: req.body.description,
    officialcontract: req.body.officialcontract,
    blog: req.body.blog,
    reddit: req.body.reddit,
    slack: req.body.slack,
    facebook: req.body.facebook,
    twitter: req.body.twitter,
    bitcoin: req.body.bitcoin,
    github: req.body.github,
    telegram: req.body.telegram,
    whitepaper: req.body.whitepaper,
    ticker: req.body.ticker,
    comment: req.body.comment,
  })
    .save()
    .then(() => res.json({ success: true }));
};

exports.getTokenInfo = async (req, res) => {
  var tokenInfo = [];

  try {
    tokenInfo = await TokenInfo.find({ checked: 0 }).lean();
    var tokenInfoCount = 0;
    if(tokenInfo)
      tokenInfoCount = tokenInfo.length

    res.status(200).json({
      success: true,
      tokenInfo: tokenInfo,
      tokenInfoCount: tokenInfoCount
    });
  } catch (err) {
    console.log("Get detail of token error" + err);
  }
};

exports.getConfirmTokenInfo = async (req, res) => {
  var tokenInfo = [];

  try {
    tokenInfo = await TokenInfo.find({ checked: 1 }).lean();

    res.status(200).json({
      success: true,
      tokenInfo: tokenInfo,
    });
  } catch (err) {
    console.log("get detail of ERC20token error" + err);
  }
};

exports.upDateManytokens = async (req, res) => {
  if (req.body.length > 0) {
    await TokenInfo.updateMany(
      {
        _id: {
          $in: req.body,
        },
      },
      { $set: { checked: 1 } }
    );
    res.json({ message: "TokenInfos are added successfully." });
  } else {
    res.status(400).json({ message: "No Ids found" });
  }
};

exports.updateToken = async (req, res) => {
  addr = await TokenInfo.updateOne({ _id: req.body._id }, req.body, {
    upsert: true,
    setDefaultsOnInsert: true,
  }).then(() => res.json({ success: true }));
};

exports.deleteToken = async (req, res) => {
  TokenInfo.findOne({ _id: req.params.id })
    .then((token) => {
      token.remove().then(() => res.json({ success: true }));
    })
    .catch((err) => res.status(404).json({ postnotfound: "No post found" }));
};

exports.getErc20Token = async (req, res) => {
  const page = parseInt(req.params.page) + 1;
  const rowsPerPage = parseInt(req.params.rowsPerPage);
  const skipIndex = (page - 1) * rowsPerPage;
  var totalErc20Cnt = 0;
  var erc20token = [];

  try {
    totalErc20Cnt = await Token.countDocuments({ type: tokentype.erc20 });
    const erc20tokens = await Token.find({ type: tokentype.erc20 })
      .lean()
      .limit(rowsPerPage)
      .skip(skipIndex);

    for (let i = 0; i < erc20tokens.length; i++) {
      const holderCnt = await Account.find({
        "holdingTokens.address": erc20tokens[i].address.toLowerCase(),
      }).count();

      var cnt;
      if (holderCnt !== 0 || holderCnt !== null) {
        cnt = holderCnt;
      } else {
        cnt = 0;
      }

      var tokens = {
        name: erc20tokens[i].name,
        address: erc20tokens[i].address.toLowerCase(),
        symbol: erc20tokens[i].symbol,
        type: erc20tokens[i].type,
        holders: cnt,
      };
      erc20token.push(tokens);
    }

    res.status(200).json({
      success: true,
      erc20tokens: erc20token,
      totalErc20Cnt: totalErc20Cnt,
    });
  } catch (err) {
    console.log("get detail of ERC20token error" + err);
  }
};

exports.getErc721Token = async (req, res) => {
  var today = new Date();
  var erc721TokenCnt = 0;
  var erc721TokenAddresses = [];
  const page = parseInt(req.params.page);
  const rowsPerPage = parseInt(req.params.rowsPerPage);
  const currentTimestamp = Math.round(today.getTime() / 1000);
  const yesterdayTimestamp = currentTimestamp - constants.DAY_IN_SECONDS;
  const LastWeekTimestamp = currentTimestamp - constants.WEEK_IN_SECONDS;

  try {
    var erc721Tokens = await Token.find({ type: tokentype.erc721 }).lean();
    erc721TokenCnt = erc721Tokens.length;
    for (let i = 0; i < erc721TokenCnt; i++) {
      erc721TokenAddresses.push(erc721Tokens[i].address);
      erc721Tokens[i] = {
        ...erc721Tokens[i],
        count: 0,
        weekCount: 0,
      };
    }

    var erc721TokenTxnsWithCnt = await Transaction.aggregate([
      {
        $match: {
          $and: [
            { to: { $in: erc721TokenAddresses } },
            { timestamp: { $gte: yesterdayTimestamp, $lte: currentTimestamp } },
          ],
        },
      },
      {
        $unwind: "$to",
      },
      {
        $group: {
          _id: "$to",
          count: {
            $sum: 1,
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    var erc721TokenWeekTxnsWithCnt = await Transaction.aggregate([
      {
        $match: {
          $and: [
            { to: { $in: erc721TokenAddresses } },
            { timestamp: { $gte: LastWeekTimestamp, $lte: currentTimestamp } },
          ],
        },
      },
      {
        $unwind: "$to",
      },
      {
        $group: {
          _id: "$to",
          count: {
            $sum: 1,
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    //find matching element in erc721Tokens and merge it into corresponding element in erc721TokenTxnsWithCnt
    for (let i = 0; i < erc721TokenCnt; i++) {
      var matchingToken = erc721TokenTxnsWithCnt.find(
        (element) => element["_id"] === erc721Tokens[i].address
      );
      var matchingTokenWeek = erc721TokenWeekTxnsWithCnt.find(
        (element) => element["_id"] === erc721Tokens[i].address
      );
      if (matchingToken) {
        erc721Tokens[i].count = matchingToken.count;
      }
      if (matchingTokenWeek) {
        erc721Tokens[i].weekCount = matchingTokenWeek.count;
      }
    }
    //sort by txn count
    erc721Tokens = erc721Tokens.sort((a, b) => {
      return b.weekCount + b.count - a.weekCount - a.count;
    });

    var pageStartIndex = page * rowsPerPage + 1;
    var pageEndIndex = (page + 1) * rowsPerPage;

    res.status(200).json({
      success: true,
      erc721Tokens: erc721Tokens.slice(pageStartIndex - 1, pageEndIndex - 1),
      totalErc721TokenCnt: erc721TokenCnt,
    });
  } catch (err) {
    console.log("get detail of transaction error" + err);
    res.status(401).json({ error: err.message });
  }
};

exports.getErc721Inventory = async (req, res) => {
  const tokenAddress = req.params.tokenAddress;
  const page = parseInt(req.params.page) + 1;
  const rowsPerPage = parseInt(req.params.rowsPerPage);
  const skipIndex = (page - 1) * rowsPerPage;

  const unwindByHoldingTokens = {
    $unwind: {
      path: "$holdingTokens",
    },
  };

  const unwindByTokenIds = {
    $unwind: {
      path: "$holdingTokens.tokenIds",
    },
  };

  const matchByContractAddress = {
    $match: {
      "holdingTokens.address": { $eq: tokenAddress },
    },
  };

  const sortByTokenId = {
    $sort: {
      "holdingTokens.tokenId": 1,
    },
  };
  const filterFields = {
    $project: {
      _id: 0,
      address: 1,
      tokenId: "$holdingTokens.tokenIds",
    },
  };
  erc721Inventories = await Account.aggregate([
    unwindByHoldingTokens,
    unwindByTokenIds,
    matchByContractAddress,
    sortByTokenId,
    filterFields,
  ]);
  try {
    res.status(200).json({
      success: true,
      count: erc721Inventories.length,
      erc721Inventories: erc721Inventories.slice(
        skipIndex,
        skipIndex + rowsPerPage
      ),
      page: page,
      rowsPerPage: rowsPerPage,
    });
  } catch (err) {
    console.log(err);
    res.status(401).json({ error: err.message });
  }
};

exports.getErc721Transfer = async (req, res) => {
  const page = parseInt(req.params.page) + 1;
  const rowsPerPage = parseInt(req.params.rowsPerPage);
  const skipIndex = (page - 1) * rowsPerPage;
  var erc721TransferCnt = 0;
  var erc721transfer = [];
  try {
    const erc721transfers = await Transaction.find({
      "token.type": tokentype.erc721,
      // "token.decodeMethodData.method": "mint",
      // status: "true",
    })
      .sort({ timestamp: -1 })
      .lean()
      .limit(rowsPerPage)
      .skip(skipIndex);

    erc721TransferCnt = await Transaction.countDocuments({
      "token.type": tokentype.erc721,
      // "token.decodeMethodData.method": "mint",
      // status: "true",
    });
    const blockchainStatus = await BlockchainStatus.findOne(
      {},
      { syncno: 1, epoch_syncno: 1, _id: 0 },
      { sort: { updatedAt: -1 } }
    );
    const lastBlockNumber = blockchainStatus.syncno;

    for (let i = 0; i < erc721transfers.length; i++) {
      var transfers = {
        hash: erc721transfers[i].hash.toLowerCase(),
        from: erc721transfers[i].from.toLowerCase(),
        to: erc721transfers[i].to.toLowerCase(),
        value: erc721transfers[i].token.decodeMethodData.inputs[1],
        decimal: erc721transfers[i].token.decimals,
        token: erc721transfers[i].token.name,
        gasprice: erc721transfers[i].gasPrice,
        gas: erc721transfers[i].gas,
        gasused: erc721transfers[i].gasUsed,
        nonce: erc721transfers[i].nonce,
        status: erc721transfers[i].status,
        blockconfirm: lastBlockNumber - erc721transfers[i].blockNumber,
        timestamp: erc721transfers[i].timestamp,
      };
      erc721transfer.push(transfers);
    }

    res.status(200).json({
      success: true,
      erc721transfers: erc721transfer,
      erc721TransferCnt: erc721TransferCnt,
    });
  } catch (err) {
    console.log("get detail of ERC20token error" + err);
  }
};

exports.getAdminToken = async (req, res) => {
  var totalErc20Cnt = 0;
  var erc20token = [];

  try {
    totalErc20Cnt = await Token.count();
    const erc20tokens = await Token.find().lean();

    for (let i = 0; i < erc20tokens.length; i++) {
      var tokens = {
        id: erc20tokens[i]._id,
        name: erc20tokens[i].name,
        address: erc20tokens[i].address.toLowerCase(),
        symbol: erc20tokens[i].symbol,
        type: erc20tokens[i].type,
      };
      erc20token.push(tokens);
    }

    res.status(200).json({
      success: true,
      erc20tokens: erc20token,
      totalErc20Cnt: totalErc20Cnt,
    });
  } catch (err) {
    console.log("get detail of ERC20token error" + err);
  }
};

exports.getErc20Transfer = async (req, res) => {
  const page = parseInt(req.params.page) + 1;
  const rowsPerPage = parseInt(req.params.rowsPerPage);
  const skipIndex = (page - 1) * rowsPerPage;
  var erc20TransferCnt = 0;
  var erc20transfer = [];
  try {
    const erc20transfers = await Transaction.find({
      "token.type": tokentype.erc20,
      "token.decodeMethodData.method": "transfer",
    })
      .sort({ timestamp: -1 })
      .lean()
      .limit(rowsPerPage)
      .skip(skipIndex);

    erc20TransferCnt = await Transaction.countDocuments({
      "token.type": tokentype.erc20,
      "token.decodeMethodData.method": "transfer",
      status: "true",
    });
    const blockchainStatus = await BlockchainStatus.findOne(
      {},
      { syncno: 1, epoch_syncno: 1, _id: 0 },
      { sort: { updatedAt: -1 } }
    );
    const lastBlockNumber = blockchainStatus.syncno;

    for (let i = 0; i < erc20transfers.length; i++) {
      var transfers = {
        hash: erc20transfers[i].hash.toLowerCase(),
        from: erc20transfers[i].from.toLowerCase(),
        to: erc20transfers[i].to.toLowerCase(),
        value: erc20transfers[i].token.decodeMethodData.inputs[1],
        decimal: erc20transfers[i].token.decimals,
        token: erc20transfers[i].token.name,
        gasprice: erc20transfers[i].gasPrice,
        gas: erc20transfers[i].gas,
        gasused: erc20transfers[i].gasUsed,
        nonce: erc20transfers[i].nonce,
        status: erc20transfers[i].status,
        blockconfirm: lastBlockNumber - erc20transfers[i].blockNumber,
        timestamp: erc20transfers[i].timestamp,
      };
      erc20transfer.push(transfers);
    }

    res.status(200).json({
      success: true,
      erc20transfers: erc20transfer,
      erc20TransferCnt: erc20TransferCnt,
    });
  } catch (err) {
    console.log("get detail of ERC20token error" + err);
  }
};

exports.getTokenDetail = async (req, res) => {
  const page = parseInt(req.params.page) + 1;
  const rowsPerPage = parseInt(req.params.rowsPerPage);
  const skipIndex = (page - 1) * rowsPerPage;
  const tokenAddress = req.params.tokenAddress.toLowerCase();

  try {
    const token = await Token.findOne({
      address: tokenAddress,
    });
    if (token && token.type) {
      var tokenType = token.type;
      if (tokenType === tokentype.erc20) {
        try {
          const matchByToken = {
            $match: {
              $or: [
                { to: { $eq: tokenAddress } },
                { contractAddress: { $eq: tokenAddress } },
              ],
            },
          };
          const unwindByHoldingTokens = {
            $unwind: {
              path: "$token.tokenTransfers",
            },
          };
          const filterFields = {
            $project: {
              _id: 0,
              hash: 1,
              method: {
                $cond: [
                  {
                    $ifNull: ["$token.decodeMethodData.method", false],
                  },
                  "$token.decodeMethodData.method",
                  {
                    $substr: ["$input", 0, 10],
                  },
                ],
              },
              from: "$token.tokenTransfers.from",
              to: "$token.tokenTransfers.to",
              quantity: "$token.tokenTransfers.value",
              timestamp: 1,
            },
          };
          const sortDec = { $sort: { timestamp: -1 } };
          tokenTransfers = await Transaction.aggregate([
            matchByToken,
            unwindByHoldingTokens,
            filterFields,
            sortDec,
          ]);

          var tabs = [constants.TOKEN_PAGE_TABS.TRANSFERS];
          tabs.push(
            constants.TOKEN_PAGE_TABS.HOLDERS,
            constants.TOKEN_PAGE_TABS.INFO,
            constants.TOKEN_PAGE_TABS.EXCHANGE,
            constants.TOKEN_PAGE_TABS.CONTRACT,
            constants.TOKEN_PAGE_TABS.ANALYTICS,
            constants.TOKEN_PAGE_TABS.COMMENTS
          );
          return res.status(200).json({
            success: true,
            tokenTransfers: tokenTransfers.slice(
              skipIndex,
              skipIndex + rowsPerPage
            ),
            tabs: tabs,
          });
        } catch (err) {
          return res.status(200).json({
            success: false,
            error: err.message,
          });
        }
      } else if (tokenType === tokentype.erc721) {
        try {
          const matchByToken = {
            $match: {
              $or: [
                { to: { $eq: tokenAddress } },
                { contractAddress: { $eq: tokenAddress } },
              ],
            },
          };
          const unwindByHoldingTokens = {
            $unwind: {
              path: "$token.tokenTransfers",
            },
          };
          const filterFields = {
            $project: {
              _id: 0,
              hash: 1,
              method: {
                $cond: [
                  {
                    $ifNull: ["$token.decodeMethodData.method", false],
                  },
                  "$token.decodeMethodData.method",
                  {
                    $substr: ["$input", 0, 10],
                  },
                ],
              },
              from: "$token.tokenTransfers.from",
              to: "$token.tokenTransfers.to",
              tokenId: "$token.tokenTransfers.value",
              timestamp: 1,
            },
          };

          const sortDec = { $sort: { timestamp: -1 } };
          tokenTransfers = await Transaction.aggregate([
            matchByToken,
            unwindByHoldingTokens,
            filterFields,
            sortDec,
          ]);

          var tabs = [constants.TOKEN_PAGE_TABS.TRANSFERS];
          tabs.push(
            constants.TOKEN_PAGE_TABS.HOLDERS,
            constants.TOKEN_PAGE_TABS.INVENTORY,
            constants.TOKEN_PAGE_TABS.INFO,
            constants.TOKEN_PAGE_TABS.CONTRACT,
            constants.TOKEN_PAGE_TABS.COMMENTS
          );
          return res.status(200).json({
            success: true,
            tokenTransfers: tokenTransfers.slice(
              skipIndex,
              skipIndex + rowsPerPage
            ),
            tabs: tabs,
          });
        } catch (err) {
          return res.status(401).json({
            success: false,
            error: err.message,
          });
        }
      }
    } else {
      return res.status(200).json({
        success: false,
        error: "Can not find this token address",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getTokenDetailInfo = async (req, res) => {
  const tokenAddress = req.params.tokenAddress.toLowerCase();

  var tokenType;
  try {
    const token = await Token.findOne({
      address: tokenAddress,
    });
    if (token && token.type) {
      tokenType = token.type;
      var profileInfo = {
        officialSite: '',
        email: '',
        blog: '',
        reddit: '',
        twitter: '',
        github: '',
        telegram: '',
        discord: '',
        coinmarketcap: '',
        coingecko: '',
        facebook: '',
        whitepaper: '',
      }

      if(token.isShown === "true")
      {
        const tokenInformation = await Token.aggregate([
          {
            $unwind: "$tokenInformation"
          },
          {
            $match: {
              address: tokenAddress,
              isShown: "true",
              "tokenInformation.checked": "true"
            }
          }
        ])

        if(tokenInformation[0].tokenInformation !== undefined) {
          profileInfo.officialSite = tokenInformation[0].tokenInformation.officialUrl
          profileInfo.email = tokenInformation[0].tokenInformation.officialEmailAdd
          profileInfo.blog = tokenInformation[0].tokenInformation.blog
          profileInfo.reddit = tokenInformation[0].tokenInformation.reddit
          profileInfo.twitter = tokenInformation[0].tokenInformation.twitter
          profileInfo.github = tokenInformation[0].tokenInformation.github
          profileInfo.telegram = tokenInformation[0].tokenInformation.telegram
          profileInfo.discord = tokenInformation[0].tokenInformation.slack
          profileInfo.coinmarketcap = tokenInformation[0].tokenInformation.bitcointalk
          profileInfo.coingecko = tokenInformation[0].tokenInformation.priceData
          profileInfo.facebook = tokenInformation[0].tokenInformation.facebook
          profileInfo.whitepaper = tokenInformation[0].tokenInformation.whitepaper
        }
      }

      if (tokenType === tokentype.erc20) {
        var totalSupply = 0;
        var decimals = 18;
        var transferCnt = 0;
        var tokenTransfers = [];
        var err_msg = [];
        decimals = token.decimals;
        totalSupply = await getTotalSupply(tokenAddress, decimals, tokentype.erc20)

        var symbol = '';
        if(token.symbol)
          symbol = token.symbol

        try {
          const matchByToken = {
            $match: {
              $or: [
                { to: { $eq: tokenAddress } },
                { contractAddress: { $eq: tokenAddress } },
              ],
            },
          };
          const unwindByHoldingTokens = {
            $unwind: {
              path: "$token.tokenTransfers",
            },
          };
          const filterFields = {
            $project: {
              _id: 0,
              hash: 1,
              method: {
                $cond: [
                  {
                    $ifNull: ["$token.decodeMethodData.method", false],
                  },
                  "$token.decodeMethodData.method",
                  {
                    $substr: ["$input", 0, 10],
                  },
                ],
              },
              from: "$token.tokenTransfers.from",
              to: "$token.tokenTransfers.to",
              quantity: "$token.tokenTransfers.value",
              timestamp: 1,
            },
          };
          const sortDec = { $sort: { timestamp: -1 } };
          tokenTransfers = await Transaction.aggregate([
            matchByToken,
            unwindByHoldingTokens,
            filterFields,
            sortDec,
          ]);
          transferCnt = tokenTransfers.length;
        } catch (err) {
          console.log(err);
          err_msg.push(err.message);
        }

        try {
          const tokenName = await Token.find({
            address: tokenAddress,
          });

          var sum = 0;
          const tokenHoldersCnt = await Account.countDocuments({
            "holdingTokens.address": tokenAddress,
          });
          if(!tokenHoldersCnt)
            tokenHoldersCnt = 0

          return res.status(200).json({
            success: true,
            transferCnt: transferCnt,
            tokenHoldersCnt: tokenHoldersCnt,
            tokenName: tokenName,
            totalSupply: totalSupply,
            decimals: decimals,
            tokenType: tokentype.erc20,
            tokenSymbol: symbol,
            profileInfo: profileInfo,
          });
        } catch (err) {
          return res.status(200).json({
            success: false,
            error: err.message,
          });
        }
      } else if (tokenType === tokentype.erc721) {
        var totalSupply = 0;
        var transferCnt = 0;
        var tokenTransfers = [];
        var err_msg = [];
        var decimals = 18;
        decimals = token.decimals;
        totalSupply = await getTotalSupply(tokenAddress, decimals, tokentype.erc721)

        var symbol = '';
        if(token.symbol)
          symbol = token.symbol

        const tokenHoldersCnt = await Account.countDocuments({
          "holdingTokens.address": tokenAddress,
        });

        try {
          const matchByToken = {
            $match: {
              $or: [
                { to: { $eq: tokenAddress } },
                { contractAddress: { $eq: tokenAddress } },
              ],
            },
          };
          const unwindByHoldingTokens = {
            $unwind: {
              path: "$token.tokenTransfers",
            },
          };
          const filterFields = {
            $project: {
              _id: 0,
              hash: 1,
              method: {
                $cond: [
                  {
                    $ifNull: ["$token.decodeMethodData.method", false],
                  },
                  "$token.decodeMethodData.method",
                  {
                    $substr: ["$input", 0, 10],
                  },
                ],
              },
              from: "$token.tokenTransfers.from",
              to: "$token.tokenTransfers.to",
              tokenId: "$token.tokenTransfers.value",
              timestamp: 1,
            },
          };

          const sortDec = { $sort: { timestamp: -1 } };
          tokenTransfers = await Transaction.aggregate([
            matchByToken,
            unwindByHoldingTokens,
            filterFields,
            sortDec,
          ]);
          transferCnt = tokenTransfers.length;
        } catch (err) {
          console.log(err);
          err_msg.push(err.message);
        }

        try {
          const tokenName = await Token.find({
            address: tokenAddress,
          });

          return res.status(200).json({
            success: true,
            transferCnt: transferCnt,
            tokenName: tokenName,
            totalSupply: totalSupply,
            tokenType: tokentype.erc721,
            tokenHoldersCnt: tokenHoldersCnt,
            decimals: decimals,
            tokenSymbol: symbol,
            profileInfo: profileInfo,
          });
        } catch (err) {
          return res.status(401).json({
            success: false,
            error: err.message,
          });
        }
      }
    } else {
      return res.status(200).json({
        success: false,
        error: "Can not find this token address",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getTokenDetailBySearch = async (req, res) => {
  const page = parseInt(req.body.page) + 1;
  const rowsPerPage = parseInt(req.body.rowsPerPage);
  const skipIndex = (page - 1) * rowsPerPage;
  const tokenAddress = req.body.tokenAddress.toLowerCase();
  const keyword = req.body.keyword.toLowerCase();

  try {
    const token = await Token.findOne({
      address: tokenAddress,
    });

    if (token && token.type) {
      let tokenType = token.type;
      var err_msg = [];
      var tokenTransfers = [];
      var totalQuantity = 0;
      var transferCnt = 0;
      var state = 0;
      var decimals = 18;
      decimals = token.decimals;

      if (tokenType === tokentype.erc20) {
        try {
          let result = await searchErc20Transactions(tokenAddress, keyword, decimals, tokentype.erc20);
          tokenTransfers = result.tokenTransfers;
          totalQuantity = result.totalQuantity;
          state = result.state;
          transferCnt = tokenTransfers.length;
        } catch (err) {
          console.log(err);
          err_msg.push(err.message);
        }

        var tabs = [constants.TOKEN_PAGE_TABS.TRANSFERS];
        if(state === 0) {
          tabs.push(
            constants.TOKEN_PAGE_TABS.INFO,
            constants.TOKEN_PAGE_TABS.EXCHANGE,
            constants.TOKEN_PAGE_TABS.CONTRACT,
          );
        } else {
          tabs.push(
            constants.TOKEN_PAGE_TABS.INFO,
            constants.TOKEN_PAGE_TABS.CONTRACT,
            constants.TOKEN_PAGE_TABS.ANALYTICS,
          );
        }
        
        return res.status(200).json({
          success: true,
          tokenTransfers: tokenTransfers.slice(
            skipIndex,
            skipIndex + rowsPerPage
          ),
          totalQuantity: totalQuantity,
          transferCnt: transferCnt,
          tabs: tabs,
        });
      } else if (tokenType === tokentype.erc721) {
        var totalQuantity = 0
        try {
          let result = await searchErc20Transactions(tokenAddress, keyword, decimals, tokentype.erc721);
          tokenTransfers = result.tokenTransfers;
          totalQuantity = result.totalQuantity;
          transferCnt = tokenTransfers.length;
        } catch (err) {
          console.log(err);
          err_msg.push(err.message);
        }

        var tabs = [constants.TOKEN_PAGE_TABS.TRANSFERS];
        tabs.push(
          constants.TOKEN_PAGE_TABS.INVENTORY,
          constants.TOKEN_PAGE_TABS.INFO,
          constants.TOKEN_PAGE_TABS.CONTRACT
        );
        return res.status(200).json({
          success: true,
          tokenTransfers: tokenTransfers.slice(
            skipIndex,
            skipIndex + rowsPerPage
          ),
          transferCnt: transferCnt,
          totalQuantity: totalQuantity,
          tabs: tabs,
        });
      }
    } else {
      return res.status(200).json({
        success: false,
        error: "Can not find this token address",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getFilteredTransfers = async (req, res) => {
  const tokenAddress = req.params.tokenAddress.toLowerCase();
  const keyword = req.params.keyword.toLowerCase();
  const page = parseInt(req.params.page);
  const rowsPerPage = parseInt(req.params.rowsPerPage);
  const skipIndex = page * rowsPerPage;
  try {
    const matchByToken = {
      $match: {
        $or: [
          { to: { $eq: tokenAddress } },
          { contractAddress: { $eq: tokenAddress } },
        ],
      },
    };
    const unwindByHoldingTokens = {
      $unwind: {
        path: "$token.tokenTransfers",
      },
    };
    const filterFields = {
      $project: {
        _id: 0,
        method: {
          $cond: [
            {
              $ifNull: ["$token.decodeMethodData.method", false],
            },
            "$token.decodeMethodData.method",
            {
              $substr: ["$input", 0, 10],
            },
          ],
        },
        from: "$token.tokenTransfers.from",
        to: "$token.tokenTransfers.to",
        hash: 1,
        quantity: "$token.tokenTransfers.value",
        timestamp: 1,
      },
    };
    const matchByAddressAndTxn = {
      $match: {
        $or: [
          { from: { $regex: ".*" + keyword + ".*", $options: "i" } },
          { to: { $regex: ".*" + keyword + ".*", $options: "i" } },
          { hash: { $regex: ".*" + keyword + ".*", $options: "i" } },
        ],
      },
    };

    const sortDec = { $sort: { timestamp: -1 } };
    const skip = {
      $skip: skipIndex,
    };
    const limit = { $limit: rowsPerPage };
    tokenTransfers = await Transaction.aggregate([
      matchByToken,
      unwindByHoldingTokens,
      filterFields,
      matchByAddressAndTxn,
      sortDec,
    ]);
    transferCnt = tokenTransfers.length;
    tokenTransfers = tokenTransfers.slice(skipIndex, rowsPerPage);
    return res.status(200).json({
      success: true,
      tokenTransfers: tokenTransfers,
      totalCnt: transferCnt,
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getTokenHolders = async (req, res) => {
  const page = parseInt(req.params.page) + 1;
  const rowsPerPage = parseInt(req.params.rowsPerPage);
  const skipIndex = (page - 1) * rowsPerPage;
  const tokenAddress = req.params.tokenAddress.toLowerCase();
  const tokenType = req.params.tokenType;

  var totalSupply = 0;
  var decimals = 18;
  var tokenHolders = [];
  try {
    const matchByToken = {
      $match: {
        'holdingTokens.address': { $regex: new RegExp(`^${tokenAddress}$`, 'i') }
      },
    };
    const unwindByHoldingTokens = {
      $unwind: {
        path: "$holdingTokens",
      },
    };
    const filterFields = {
      $project: {
        _id: 0,
        address: 1,
        balance: { $toDouble: "$holdingTokens.balance" },
        decimals: "$holdingTokens.decimals",
      },
    };
    const sortDec = {
      $sort: {
        balance: -1,
      },
    };
    tokenHolders = await Account.aggregate([
      matchByToken,
      unwindByHoldingTokens,
      matchByToken,
      filterFields,
      sortDec,
    ]);

    const tokenHoldersLength = tokenHolders.length;
    if (tokenHoldersLength > 0) {
      decimals = parseInt(tokenHolders[0].decimals);

      for (let i = 0; i < tokenHoldersLength; i++) {
        totalSupply += tokenHolders[i].balance;
      }

      const unit = Math.pow(10, decimals);
      if(tokenType === tokentype.erc20)
      {
        totalSupply /= unit;
      }

      for (let i = 0; i < tokenHoldersLength; i++) {
        if(tokenType === tokentype.erc20)
          tokenHolders[i].balance /= unit;

        tokenHolders[i].percent = (tokenHolders[i].balance / totalSupply) * 100;
      }
    }

    return res.status(200).json({
      success: true,
      tokenHolders: tokenHolders.slice(skipIndex, skipIndex + rowsPerPage),
      holdersCnt: tokenHolders.length,
    });
  } catch (err) {
    console.log("get detail of ERC20token error" + err);
    return res.status(200).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getTopTokenHolders = async (req, res) => {
  const showCount = req.params.showCount;
  const tokenAddress = req.params.tokenAddress.toLowerCase();

  // var contract = new web3.eth.Contract(ABI, tokenAddress);
  // var totalSupply = await contract.methods.totalSupply().call();
  // console.log("web__" + totalSupply)

  var tokenName = await Token.findOne({ address: tokenAddress });
  var topTokenName = "";
  var tokenHolderType  = tokentype.erc20 ;
  var decimals = 0;
  if (tokenName) {
    topTokenName = tokenName.name;
    decimals = tokenName.decimals;
    tokenHolderType = tokenName.type;
  }

  var totalTokenSupply = 0;
  var selTokenSupply = 0;
  var tokenHolderCount = 0;
  var topTokenHolders = [];
  try {
    var topTotalTokenHolders = await Account.aggregate([
      {
        $unwind: "$holdingTokens",
      },
      {
        $match: {
          'holdingTokens.address': { $regex: new RegExp(`^${tokenAddress}$`, 'i') }
        },
      },
      {
        $sort: {
          "holdingTokens.balance": -1, //Sort by Date Added DESC
        },
      },
    ]);

    for (let i = 0; i < topTotalTokenHolders.length; i++) {
      totalTokenSupply += parseInt(topTotalTokenHolders[i].holdingTokens.balance);

      if(tokenHolderType === tokentype.erc20) {
        topTotalTokenHolders[i].holdingTokens.balance = topTotalTokenHolders[i].holdingTokens.balance / Math.pow(10, decimals);
      }
    }
    
    if(tokenHolderType === tokentype.erc20) {
      totalTokenSupply = totalTokenSupply / Math.pow(10, decimals);
    }

    tokenHolderCount = topTotalTokenHolders.length;
    topTokenHolders = topTotalTokenHolders.slice(0, parseInt(showCount));

    for (let i = 0; i < topTokenHolders.length; i++) {
      selTokenSupply += parseFloat(topTokenHolders[i].holdingTokens.balance);
      var percent = (topTokenHolders[i].holdingTokens.balance / totalTokenSupply) * 100;
      var temp_tokenHolder = topTokenHolders[i];
      temp_tokenHolder = {
        ...topTokenHolders[i],
        percent: percent,
      };
      topTokenHolders[i] = temp_tokenHolder;
    }

    return res.status(200).json({
      success: true,
      tokenHolders: topTokenHolders,
      totalTokenSupply: totalTokenSupply,
      selTokenSupply: selTokenSupply,
      tokenHolderCount: tokenHolderCount,
      topHoldertokenName: topTokenName,
    });
  } catch (err) {
    console.log("get detail of ERC20token error" + err);
    return res.status(200).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getTokenApprovalsByAddress = async (req, res) => {
  var address, page, rowsPerPage, skipIndex, addressToTopic1;

  if (web3.utils.isAddress(req.query.fromAddress.toLowerCase())) {
    address = req.query.fromAddress.toLowerCase();
    addressToTopic1 = web3.utils.padLeft(address, 64);
    page = parseInt(req.query.page) + 1;
    rowsPerPage = parseInt(req.query.rowsPerPage);
    skipIndex = (page - 1) * rowsPerPage;
  } else {
    res.status(400).json({ msg: "Invalid address or page out of range" });
  }
  try {
    const erc20ApprovalTxns = await Transaction.aggregate([
      {
        $match: {
          $and: [
            {
              "logs.topics.0": constants.ERC20_TOKEN_APPROVAL_KECCAK,
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
                      constants.ERC20_TOKEN_APPROVAL_KECCAK,
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
    ]);
    var tokenApprovals = [];
    for (let i = 0; i < erc20ApprovalTxns.length; i++) {
      var timestamp = erc20ApprovalTxns[i].timestamp;
      for (let j = 0; j < erc20ApprovalTxns[i].logs.length; j++) {
        var log = erc20ApprovalTxns[i].logs[j];
        var tokenApproval = {};
        tokenApproval.txnHash = log.transactionHash;
        tokenApproval.block = log.blockNumber;
        var token = await Token.findOne(
          {
            address: log.address,
          },
          { _id: 0 }
        ).lean();
        if (token === null || token === undefined || token === {}) {
          break;
        }
        tokenApproval.contract = token;
        tokenApproval.approvedSpender = log.topics[2];
        tokenApproval.approvedAmount = log.data;
        tokenApproval.timestamp = timestamp;
        tokenApprovals.push(tokenApproval);
      }
    }
    console.log("skipIndex", skipIndex);
    console.log("skipIndex + rowsPerPage", skipIndex + rowsPerPage);
    res.status(200).json({
      success: true,
      erc20ApprovalTxns: tokenApprovals,
      count: tokenApprovals.length,
    });
  } catch (err) {
    console.log("get detail of ERC20token error" + err);
  }
};

exports.searchErc20Tokens = async (req, res) => {
  const keyword = req.body.keyword;
  try {
    var tokens = [];
    if (keyword === "") {
      return res.status(200).json({ success: true, data: [] });
    }
    tokens = await Token.find({
      $or: [
        { address: { $regex: ".*" + keyword + ".*", $options: "i" } },
        { name: { $regex: ".*" + keyword + ".*", $options: "i" } },
      ],
    }).lean();
    return res.status(200).json({ success: true, data: tokens });
  } catch (err) {
    return res.status(401).json({ success: false, error: err.message });
  }
};

exports.searchErc20TokensByPage = async (req, res) => {
  const keyword = req.params.keyword;
  const page = parseInt(req.params.page);
  const rowsPerPage = parseInt(req.params.rowsPerPage);
  const skipIndex = page * rowsPerPage;
  try {
    var tokens = [];
    var totalCnt = await Token.countDocuments({
      $or: [
        { address: { $regex: ".*" + keyword + ".*", $options: "i" } },
        { name: { $regex: ".*" + keyword + ".*", $options: "i" } },
      ],
    });
    tokens = await Token.find({
      $or: [
        { address: { $regex: ".*" + keyword + ".*", $options: "i" } },
        { name: { $regex: ".*" + keyword + ".*", $options: "i" } },
      ],
    })
      .lean()
      .limit(rowsPerPage)
      .skip(skipIndex);
    return res
      .status(200)
      .json({ success: true, data: tokens, totalCnt: totalCnt });
  } catch (err) {
    return res.status(401).json({ success: false, error: err.message });
  }
};


const searchErc20Transactions = async (address, keyword, decimals, type) => {
  try {
    let searchErc20Transaction;
    if(type === tokentype.erc20)
    {
      const unwindByTokenTransfers = {
        $unwind: {
          path: "$token.tokenTransfers",
        },
      };
      const matchByToken20 = {
        $match: {
          $and: [
            {
              $or: [
                { 'to': { $regex: new RegExp(`^${address}$`, 'i') } },
                { 'contractAddress': { $regex: new RegExp(`^${address}$`, 'i') } }
              ]
            },
            {
              $or: [
                { 'hash': { $regex: new RegExp(`^${keyword}$`, 'i') } },
                { 'token.tokenTransfers.from': { $regex: new RegExp(`^${keyword}$`, 'i') } },
                { 'token.tokenTransfers.to': { $regex: new RegExp(`^${keyword}$`, 'i') } },
              ],
            },
          ],
        },
      };
      const filterFields20 = {
        $project: {
          _id: 0,
          hash: 1,
          method: {
            $cond: [
              {
                $ifNull: ["$token.decodeMethodData.method", false],
              },
              "$token.decodeMethodData.method",
              {
                $substr: ["$input", 0, 10],
              },
            ],
          },
          from: "$token.tokenTransfers.from",
          to: "$token.tokenTransfers.to",
          quantity: "$token.tokenTransfers.value",
          timestamp: 1,
        },
      };

      searchErc20Transaction = await Transaction.aggregate([
        unwindByTokenTransfers,
        matchByToken20,
        filterFields20,
      ]);
    } else {
      const matchByToken721 = {
        $match: {
          $or: [
            { 'to': { $regex: new RegExp(`^${address}$`, 'i') } },
            { 'contractAddress': { $regex: new RegExp(`^${address}$`, 'i') } },
          ],
        },
      };
      const unwindByHoldingTokens = {
        $unwind: {
          path: "$token.tokenTransfers",
        },
      };
      const filterFields721 = {
        $project: {
          _id: 0,
          hash: 1,
          method: {
            $cond: [
              {
                $ifNull: ["$token.decodeMethodData.method", false],
              },
              "$token.decodeMethodData.method",
              {
                $substr: ["$input", 0, 10],
              },
            ],
          },
          from: "$token.tokenTransfers.from",
          to: "$token.tokenTransfers.to",
          tokenId: "$token.tokenTransfers.value",
          timestamp: 1,
        },
      };
      const sortDec = { $sort: { timestamp: -1 } };
      
      searchErc20Transaction = await Transaction.aggregate([
        matchByToken721,
        unwindByHoldingTokens,
        filterFields721,
        sortDec,
      ]);
    }

    let state = 0;
    if(searchErc20Transaction.length > 0)
    {
      if(keyword == searchErc20Transaction[0].hash)
        state = 0
      else
        state = 1
    }

    let totalQuantity = 0;
    if(type === tokentype.erc20)
    {
      for(let i=0; i<searchErc20Transaction.length; i++)
      {
        if(keyword === searchErc20Transaction[i].from)
          totalQuantity -= parseInt(searchErc20Transaction[i].quantity)
        else
          totalQuantity += parseInt(searchErc20Transaction[i].quantity)
      }
      if(totalQuantity < 0)
        totalQuantity = 0
      totalQuantity = (totalQuantity / Math.pow(10, decimals))
    } else {
      const unwindByAccountHold = {
        $unwind: {
          path: "$holdingTokens",
        },
      };
      const matchByHoldingToken = {
        $match: {
          $and: [
            { "address": keyword },
            { "holdingTokens.address": address },
          ]
        },
      };
  
      let searchErc721Balance = await Account.aggregate([
        unwindByAccountHold,
        matchByHoldingToken,
      ]);
      
      if(searchErc721Balance)
        totalQuantity = searchErc721Balance[0].holdingTokens.balance
    }
    
    return {
      tokenTransfers: searchErc20Transaction,
      totalQuantity: totalQuantity,
      state: state,
    };
  } catch (err) {
    return {
      tokenTransfers: [],
      totalQuantity: 0,
      state: 0,
    };
  }
};

const createDailyTransfer = (tokenTransfers, decimals) => {
  try {
    unitInWei = Math.pow(10, decimals);
    if (tokenTransfers.length === undefined || tokenTransfers.length === 0)
      return null;
    var newDayInTimestamp = tokenTransfers[0].timestamp;
    let dayInTimestamp = 86400;
    let dailyTransferAmounts = [];
    let dailyTransferCounts = [];
    let dailyUniqueSenders = [];
    let dailyUniqueReceivers = [];
    let dailyUniqueTotals = [];

    var lastDayStartingIndex = 0;
    var i = 0,
      dailyTransferQuantity = 0,
      dailyTransferCount = 0,
      dailyUniqueSender = [],
      dailyUniqueReceiver = [],
      dailyUniqueTotal = [];

    while (i < tokenTransfers.length) {
      if (tokenTransfers[i].timestamp >= newDayInTimestamp + dayInTimestamp) {
        dailyTransferAmounts.push([
          (newDayInTimestamp + dayInTimestamp) * 1000,
          dailyTransferQuantity,
        ]);

        dailyTransferCounts.push([
          (newDayInTimestamp + dayInTimestamp) * 1000,
          dailyTransferCount,
        ]);

        dailyUniqueSenders.push([
          (newDayInTimestamp + dayInTimestamp) * 1000,
          [...new Set(dailyUniqueSender)].length,
        ]);

        dailyUniqueReceivers.push([
          (newDayInTimestamp + dayInTimestamp) * 1000,
          [...new Set(dailyUniqueReceiver)].length,
        ]);

        dailyUniqueTotals.push([
          (newDayInTimestamp + dayInTimestamp) * 1000,
          [...new Set(dailyUniqueTotal)].length,
        ]);

        newDayInTimestamp += dayInTimestamp;
        dailyTransferQuantity = 0;
        dailyTransferCount = 0;
        dailyUniqueSender = [];
        dailyUniqueReceiver = [];
        dailyUniqueTotal = [];
      }
      lastDayStartingIndex += 1;
      dailyTransferQuantity += parseInt(tokenTransfers[i].quantity / unitInWei);
      dailyTransferCount++;
      dailyUniqueSender.push(tokenTransfers[i].from);
      dailyUniqueReceiver.push(tokenTransfers[i].to);
      dailyUniqueTotal.push(tokenTransfers[i].from, tokenTransfers[i].to);
      i++;
    }
    if (lastDayStartingIndex < tokenTransfers.length) {
      dailyTransferAmounts.push([
        newDayInTimestamp * 1000,
        dailyTransferQuantity,
      ]);
      dailyTransferCounts.push([newDayInTimestamp * 1000, dailyTransferCount]);
      dailyUniqueSenders.push([
        (newDayInTimestamp + dayInTimestamp) * 1000,
        [...new Set(dailyUniqueSender)].length,
      ]);
      dailyUniqueReceivers.push([
        (newDayInTimestamp + dayInTimestamp) * 1000,
        [...new Set(dailyUniqueReceiver)].length,
      ]);
      dailyUniqueTotals.push([
        (newDayInTimestamp + dayInTimestamp) * 1000,
        [...new Set(dailyUniqueTotal)].length,
      ]);
    }

    return [
      dailyTransferAmounts,
      dailyTransferCounts,
      dailyUniqueSenders,
      dailyUniqueReceivers,
      dailyUniqueTotals,
    ];
  } catch (err) {
    console.log(err.message);
    return false;
  }
};

exports.analyzeToken = async (req, res) => {
  try {
    const tokenAddress = req.params.tokenAddress;
    const token = await Token.findOne({ address: tokenAddress });
    if (token.type !== tokentype.erc20)
      return res.json({ succss: false, error: "Not a ERC 20 token" });
    const decimals = token.decimals;
    if (token) {
      const matchByToken = {
        $match: {
          $or: [
            { to: { $eq: tokenAddress } },
            { contractAddress: { $eq: tokenAddress } },
          ],
          "token.decodeMethodData.method": "transfer",
        },
      };
      const unwindByTokenTransfers = {
        $unwind: {
          path: "$token.tokenTransfers",
        },
      };
      const filterFields = {
        $project: {
          _id: 0,
          from: "$token.tokenTransfers.from",
          to: "$token.tokenTransfers.to",
          quantity: "$token.tokenTransfers.value",
          timestamp: 1,
        },
      };

      let tokenTransfers = await Transaction.aggregate([
        matchByToken,
        unwindByTokenTransfers,
        filterFields,
      ]);

      let dailyTokenTransfersAmounts = [],
        dailyTokenTransfersCounts = [],
        dailyUniqueSenders = [],
        dailyUniqueReceivers = [],
        dailyUniqueTotals = [];

      let dailyTransfer = createDailyTransfer(tokenTransfers, decimals);

      if (dailyTransfer) {
        dailyTokenTransfersAmounts = dailyTransfer[0];
        dailyTokenTransfersCounts = dailyTransfer[1];
        dailyUniqueSenders = dailyTransfer[2];
        dailyUniqueReceivers = dailyTransfer[3];
        dailyUniqueTotals = dailyTransfer[4];
      }
      return res.status(200).json({
        success: true,
        data: {
          tokenTransferAmount: dailyTokenTransfersAmounts,
          tokenTransferCount: dailyTokenTransfersCounts,
          tokenTransferUniqueSenders: dailyUniqueSenders,
          tokenTransferUniqueReceivers: dailyUniqueReceivers,
          tokenTransferUniqueTotals: dailyUniqueTotals,
        },
      });
    } else {
      return res
        .status(200)
        .json({ success: false, error: "Token does not exist" });
    }
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message });
  }
};

const calcTokenBalance = (tokenTransfers, accountAddress) => {
  let tokenBalance = 0;
  for (let i = 0; i < tokenTransfers.length; i++) {
    let tokenTransfer = tokenTransfers[i];
    console.log("from:", tokenTransfer.from);
    console.log("to:", tokenTransfer.to);
    console.log("account:", accountAddress);
    console.log("value:", parseInt(tokenTransfer.value));

    if (tokenTransfer.from.toLowerCase() === accountAddress.toLowerCase())
      tokenBalance -= parseInt(tokenTransfer.value);
    else tokenBalance += parseInt(tokenTransfer.value);
    console.log("tokenBalance:", tokenBalance);
  }
  return tokenBalance;
};

exports.getTokenBalance = async (req, res) => {
  try {
    const tokenAddress = req.body.tokenAddress;
    const accountAddress = req.body.accountAddress || null;
    const byDate = req.body.byDate || new Date();
    const byBlockNo = req.body.byBlockNo;
    console.log(new Date());
    var byTimestamp = Math.floor(new Date(byDate).getTime() / 1000);

    if (accountAddress) {
      // will return token balance of this account
      if (!web3.utils.isAddress(accountAddress)) {
        return res.status(200).json({
          success: false,
          data: {},
          error: "This address is invalid type",
        });
      } else {
        const addressDB = await Account.findOne({ address: accountAddress });
        if (empty(addressDB)) {
          return res.status(200).json({
            success: false,
            data: {},
            error: "This address is not seen on the network",
          });
        }
        // address exist and registered on the network
        const token = await Token.findOne({ address: tokenAddress });
        if (token.type !== tokentype.erc20)
          return res.json({ succss: false, error: "Not a ERC 20 token" });

        var matchByTokenAndDuration;
        if (byBlockNo) {
          matchByTokenAndDuration = {
            $match: {
              $or: [
                { to: { $eq: tokenAddress } },
                { contractAddress: { $eq: tokenAddress } },
              ],
              blockNumber: { $lte: byBlockNo },
              status: true,
            },
          };
        } else {
          matchByTokenAndDuration = {
            $match: {
              $or: [
                { to: { $eq: tokenAddress } },
                { contractAddress: { $eq: tokenAddress } },
              ],
              timestamp: { $lte: byTimestamp },
            },
          };
        }
        decimals = token.decimals;
        if (token) {
          const unwindByTokenTransfers = {
            $unwind: {
              path: "$token.tokenTransfers",
            },
          };
          const filterFields = {
            $project: {
              _id: 0,
              from: "$token.tokenTransfers.from",
              to: "$token.tokenTransfers.to",
              value: "$token.tokenTransfers.value",
              timestamp: 1,
            },
          };
          console.log(accountAddress);
          const matchByAccount = {
            $match: {
              $or: [
                {
                  from: { $regex: ".*" + accountAddress + ".*", $options: "i" },
                },
                { to: { $regex: ".*" + accountAddress + ".*", $options: "i" } },
              ],
            },
          };

          let tokenTransfers = await Transaction.aggregate([
            matchByTokenAndDuration,
            unwindByTokenTransfers,
            filterFields,
            matchByAccount,
          ]);

          let tokenBalnce = calcTokenBalance(tokenTransfers, accountAddress);

          return res.status(200).json({ success: true, data: tokenBalnce });
        }
      }
    } else {
      // will return total supply of token
      // currently no field like totalSupply is on database but as sync-server is updated, we will reference totalSupply in token collection
      const token = await Token.findOne({ address: tokenAddress });
      if (token) {
        const totalSupply = token.totalSupply || 0;
        return res.status(200).json({
          success: true,
          data: {
            totalSupply: totalSupply,
          },
        });
      } else {
        return res.status(200).json({
          success: false,
          error: "Token not exist",
        });
      }
    }
    return res.status(200).json({
      success: true,
      data: {
        tokenAddress: tokenAddress,
        accountAddress: accountAddress,
        date: date,
        blockNo: blockNo,
      },
    });
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message });
  }
};
