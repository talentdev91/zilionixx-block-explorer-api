require("dotenv").config();
const User = require("../models/UserModel");
const Transaction = require("../models/TransactionModel");
const Address = require("../models/AddressModel");
const Token = require("../models/TokenModel");
const Contract = require("../models/ContractModel");
const ApiKeyType = require("../models/ApiKeyType");
var empty = require("is-empty");
const validateProfileInput = require("./utils/profileValid");
const Validator = require("validator");
const bcrypt = require("bcryptjs");
const uuidAPIKey = require("uuid-apikey");
const axios = require("axios");

const { constants } = require("../config/constants");

const defaultPageNum = 0;
const defaultPageSize = 10;

exports.sandbox = async (req, res) => {
  return res.status(200).json({ success: true, data: req.body });
};

function paginate(arr, pageNum, pageSize) {
  if (typeof pageNum === "string") pageNum = parseInt(pageNum);
  if (typeof pageSize === "string") pageSize = parseInt(pageSize);
  let startIndex = pageNum * pageSize;
  let endIndex = startIndex + pageSize;

  return arr.slice(startIndex, endIndex);
}

function sortByDate(arr) {
  let result = arr.sort(function (a, b) {
    // Turn your strings into dates, and then subtract them
    // to get a value that is either negative, positive, or zero.
    return b.createdAt - a.createdAt;
  });

  return result;
}

function formatDate(arr) {
  for (let i = 0; i < arr.length; i++) {
    let date = new Date(arr[i].createdAt);
    const [month, day, year] = [
      date.getMonth(),
      date.getDate(),
      date.getFullYear(),
    ];
    arr[i].createdAt = year + "-" + month + "-" + day;
  }
  return arr;
}

// create a watch Address
exports.createWatchAddress = async (req, res) => {
  var username,
    watchAddress,
    watchAddressNote,
    notifyOption = 1,
    trackERC20Option = false,
    pageNum,
    pageSize;
  try {
    username = req.body.name;
    watchAddress = req.body.watchAddress;
    watchAddressNote = req.body.watchAddressNote;
    notifyOption = req.body.notifyOption;
    trackERC20Option = req.body.trackERC20Option;
    pageNum = req.body.pageNum || defaultPageNum;
    pageSize = req.body.pageSize || defaultPageSize;

    if (empty(watchAddressNote))
      return res.status(400).json({
        success: false,
        error: "Transaction note is empty. Please input transaction note",
      });

    if (empty(notifyOption)) notifyOption = 1;
    if (empty(trackERC20Option)) trackERC20Option = false;

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: "User does not exist." });

    const address = await Address.findOne({ address: watchAddress });
    if (!address)
      return res.status(404).json({
        success: false,
        error: "Address does not exist. Please check the Address hash again",
      });

    // check if this Address is already created with note
    for (let i = 0; i < user.addressWatchList.length; i++) {
      if (user.addressWatchList[i].watchAddress === watchAddress)
        return res.status(400).json({
          success: false,
          error:
            "This Address already has included into watch list. To change that edit the existing address",
        });
    }
    user.addressWatchList.push({
      watchAddress: watchAddress,
      watchAddressNote: watchAddressNote,
      notifyOption: notifyOption,
      trackERC20Option: trackERC20Option,
      createdAt: new Date(),
    });

    User.updateOne(
      {
        $or: [{ name: username }, { email: username }],
      },
      user,
      { upsert: true, setDefaultsOnInsert: true },
      async function (err) {
        if (err) {
          return res.status(500).json({
            success: false,
            error:
              "Sorry for failed Address note saving into database failed. Please try again",
          });
        }
        for (let index = 0; index < user.addressWatchList.length; index++) {
          const watchAddress = user.addressWatchList[index].watchAddress;
          var account = await Address.findOne({ address: watchAddress });
          user.addressWatchList[index].balance = account.balance || 0;
        }
        return res.status(200).json({
          success: true,
          addressWatchLists: formatDate(
            paginate(sortByDate(user.addressWatchList), pageNum, pageSize)
          ),
        });
      }
    );
    // return res.status(200).json({ success: true, user: user });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

// read txn notes from database
exports.getWatchAddressList = async (req, res) => {
  var username, pageNum, pageSize;
  try {
    username = req.body.name;
    pageNum = req.body.pageNum || defaultPageNum;
    pageSize = req.body.pageSize || defaultPageSize;

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(200)
        .json({ success: false, error: "User does not exist." });

    for (let index = 0; index < user.addressWatchList.length; index++) {
      const watchAddress = user.addressWatchList[index].watchAddress;
      var account = await Address.findOne({ address: watchAddress });
      user.addressWatchList[index].balance = account.balance || 0;
    }

    return res.status(200).json({
      success: true,
      addressWatchLists: formatDate(
        paginate(sortByDate(user.addressWatchList), pageNum, pageSize)
      ),
      totalCount: user.addressWatchList.length,
    });
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message });
  }
};

// get single txn note
exports.getSingleWatchAddress = async (req, res) => {
  var username, watchAddress;
  try {
    username = req.body.name;
    watchAddress = req.body.watchAddress;

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(200)
        .json({ success: false, error: "User does not exist." });

    // check if it is the existing Address with not and return it if exist
    for (let i = 0; i < user.addressWatchList.length; i++) {
      if (user.addressWatchList[i].watchAddress === watchAddress)
        return res.status(200).json({
          success: true,
          addressWatchList: user.addressWatchList[i],
        });
    }

    return res.status(200).json({
      success: false,
      error: "Note for this Address was not created yet.",
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

// edit a txn note
exports.editWatchAddress = async (req, res) => {
  var username,
    watchAddress,
    watchAddressNote,
    notifyOption,
    trackERC20Option,
    pageNum,
    pageSize;
  try {
    username = req.body.name;
    watchAddress = req.body.watchAddress;
    watchAddressNote = req.body.watchAddressNote;
    notifyOption = req.body.notifyOption;
    trackERC20Option = req.body.trackERC20Option;
    pageNum = req.body.pageNum || defaultPageNum;
    pageSize = req.body.pageSize || defaultPageSize;

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });

    if (!user)
      return res
        .status(404)
        .json({ success: false, error: "User does not exist." });

    var isExist = false;

    // check if it is the existing Address with not and return it if exist
    for (let i = 0; i < user.addressWatchList.length; i++) {
      if (user.addressWatchList[i].watchAddress === watchAddress) {
        isExist = !isExist;

        user.addressWatchList[i].watchAddressNote = watchAddressNote;
        user.addressWatchList[i].notifyOption = notifyOption;
        user.addressWatchList[i].trackERC20Option = trackERC20Option;
        user.addressWatchList[i].createdAt = new Date();
        const watchlistSingle = user.addressWatchList[i];
        User.updateOne(
          {
            $or: [{ name: username }, { email: username }],
          },
          user,
          { upsert: true, setDefaultsOnInsert: true },
          async function (err) {
            if (err) {
              return res.status(500).json({
                success: false,
                error:
                  "Sorry for failed Address note saving into database failed. Please try again",
              });
            }
            for (let index = 0; index < user.addressWatchList.length; index++) {
              const watchAddress = user.addressWatchList[index].watchAddress;
              var account = await Address.findOne({ address: watchAddress });
              user.addressWatchList[index].balance = account.balance || 0;
            }
            return res.status(200).json({
              success: true,
              addressWatchLists: formatDate(
                paginate(sortByDate(user.addressWatchList), pageNum, pageSize)
              ),
              addressWatchList: watchlistSingle,
            });
          }
        );
      }
    }

    if (!isExist) {
      return res.status(404).json({
        success: false,
        error: "Can not find such Address hash. Please check again",
      });
    }
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

// delete a txn note
exports.deleteWatchAddress = async (req, res) => {
  var username, watchAddress, pageNum, pageSize;
  try {
    username = req.body.name;
    watchAddress = req.body.watchAddress;
    pageNum = req.body.pageNum || defaultPageNum;
    pageSize = req.body.pageSize || defaultPageSize;

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: "User does not exist." });

    // check if it is the existing Address with not and return it if exist
    isExist = false;
    for (let i = 0; i < user.addressWatchList.length; i++) {
      if (user.addressWatchList[i].watchAddress === watchAddress) {
        isExist = true;
        if (i > -1) {
          user.addressWatchList.splice(i, 1);
        }

        User.updateOne(
          {
            $or: [{ name: username }, { email: username }],
          },
          user,
          { upsert: true, setDefaultsOnInsert: true },
          async function (err) {
            if (err) {
              return res.status(500).json({
                success: false,
                error: "Sorry for failed deletion. Please try again",
              });
            }
            for (let index = 0; index < user.addressWatchList.length; index++) {
              const watchAddress = user.addressWatchList[index].watchAddress;
              var account = await Address.findOne({ address: watchAddress });
              user.addressWatchList[index].balance = account.balance || 0;
            }
            return res.status(200).json({
              success: true,
              addressWatchLists: formatDate(
                paginate(sortByDate(user.addressWatchList), pageNum, pageSize)
              ),
              addressWatchList: {},
            });
          }
        );
      }
    }

    if (!isExist) {
      return res.status(404).json({
        success: false,
        error: "Can not find such Address hash. Please check again",
      });
    }
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

// create a note for txn
exports.createTxnNote = async (req, res) => {
  var username, txnHash, txnNote, pageNum, pageSize;
  try {
    username = req.body.name;
    txnHash = req.body.txnHash;
    txnNote = req.body.txnNote;
    pageNum = req.body.pageNum || defaultPageNum;
    pageSize = req.body.pageSize || defaultPageSize;

    if (empty(txnNote))
      return res.status(200).json({
        success: false,
        error: "Transaction note is empty. Please input transaction note",
      });

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(200)
        .json({ success: false, error: "User does not exist." });

    const txn = await Transaction.findOne({ hash: txnHash });
    if (!txn)
      return res.status(200).json({
        success: false,
        error:
          "Transaction does not exist. Please check the transaction hash again",
      });

    // check if this transaction is already created with note
    for (let i = 0; i < user.txnNotes.length; i++) {
      if (user.txnNotes[i].txn === txnHash)
        return res.status(200).json({
          success: false,
          error:
            "This transaction already has note. To change that edit the existing note",
        });
    }

    const txnSingle = { txn: txnHash, note: txnNote, createdAt: new Date() };
    user.txnNotes.push(txnSingle);

    User.updateOne(
      {
        $or: [{ name: username }, { email: username }],
      },
      user,
      { upsert: true, setDefaultsOnInsert: true },
      function (err) {
        if (err) {
          return res.status(200).json({
            success: false,
            error:
              "Sorry for failed transaction note saving into database failed. Please try again",
          });
        }
        return res.status(200).json({
          success: true,
          txnNotes: formatDate(
            paginate(sortByDate(user.txnNotes), pageNum, pageSize)
          ),
          txnNote: txnSingle,
          totalCount: user.txnNotes.length,
        });
      }
    );
    // return res.status(200).json({ success: true, user: user });
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message });
  }
};

// read txn notes from database
exports.getTxnNotes = async (req, res) => {
  var username, pageNum, pageSize;
  try {
    username = req.body.name;
    pageNum = req.body.pageNum || defaultPageNum;
    pageSize = req.body.pageSize || defaultPageSize;

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(200)
        .json({ success: false, error: "User does not exist." });

    return res.status(200).json({
      success: true,
      txnNotes: formatDate(
        paginate(sortByDate(user.txnNotes), pageNum, pageSize)
      ),
      totalCount: user.txnNotes.length,
    });
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message });
  }
};

// get single txn note
exports.getSingleNote = async (req, res) => {
  var username, txnHash;
  try {
    username = req.body.name;
    txnHash = req.body.txnHash;

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(200)
        .json({ success: false, error: "User does not exist." });

    // check if it is the existing transaction with not and return it if exist
    for (let i = 0; i < user.txnNotes.length; i++) {
      if (user.txnNotes[i].txn === txnHash)
        return res.status(200).json({
          success: true,
          txnNotes: [user.txnNotes[i]],
          txnNote: user.txnNotes[i],
        });
    }

    return res.status(200).json({
      success: false,
      error: "Note for this transaction was not created yet.",
    });
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message });
  }
};

// edit a txn note
exports.editNote = async (req, res) => {
  var username, txnHash, txnNote, pageNum, pageSize;
  try {
    username = req.body.name;
    txnHash = req.body.txnHash;
    txnNote = req.body.txnNote;
    pageNum = req.body.pageNum || defaultPageNum;
    pageSize = req.body.pageSize || defaultPageSize;

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: "User does not exist." });

    var isExist = false;

    // check if it is the existing transaction with not and return it if exist
    for (let i = 0; i < user.txnNotes.length; i++) {
      if (user.txnNotes[i].txn === txnHash) {
        isExist = !isExist;

        user.txnNotes[i].note = txnNote;
        user.txnNotes[i].createdAt = new Date();
        const txnSingle = user.txnNotes[i];
        User.updateOne(
          {
            $or: [{ name: username }, { email: username }],
          },
          user,
          { upsert: true, setDefaultsOnInsert: true },
          function (err) {
            if (err) {
              return res.status(500).json({
                success: false,
                error:
                  "Sorry for failed transaction note saving into database failed. Please try again",
              });
            }
            return res.status(200).json({
              success: true,
              txnNotes: formatDate(
                paginate(sortByDate(user.txnNotes), pageNum, pageSize)
              ),
              txnNote: txnSingle,
            });
          }
        );
      }
    }

    if (!isExist) {
      return res.status(404).json({
        success: false,
        error: "Can not find such Transaction hash. Please check again",
      });
    }
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

// delete a txn note
exports.deleteNote = async (req, res) => {
  var username, txnHash, pageNum, pageSize;
  try {
    username = req.body.name;
    txnHash = req.body.txnHash;
    pageNum = req.body.pageNum || defaultPageNum;
    pageSize = req.body.pageSize || defaultPageSize;

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: "User does not exist." });

    // check if it is the existing transaction with not and return it if exist
    isExist = false;
    for (let i = 0; i < user.txnNotes.length; i++) {
      if (user.txnNotes[i].txn === txnHash) {
        isExist = true;
        if (i > -1) {
          user.txnNotes.splice(i, 1);
        }

        User.updateOne(
          {
            $or: [{ name: username }, { email: username }],
          },
          user,
          { upsert: true, setDefaultsOnInsert: true },
          function (err) {
            if (err) {
              return res.status(500).json({
                success: false,
                error: "Sorry for failed deletion. Please try again",
              });
            }
            return res.status(200).json({
              success: true,
              txnNotes: formatDate(
                paginate(sortByDate(user.txnNotes), pageNum, pageSize)
              ),
              txnNote: {},
              totalCount: user.txnNotes.length,
            });
          }
        );
      }
    }

    if (!isExist) {
      return res.status(404).json({
        success: false,
        error: "Can not find such transaction hash. Please check again",
      });
    }
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

// create a note for address
exports.createAddressNote = async (req, res) => {
  var username, address, addressNote, nameTag, pageNum, pageSize;
  try {
    username = req.body.name;
    address = req.body.address;
    addressNote = req.body.addressNote;
    nameTag = req.body.nameTag;
    pageNum = req.body.pageNum || defaultPageNum;
    pageSize = req.body.pageSize || defaultPageSize;

    // if (empty(addressNote))
    //   return res.status(400).json({
    //     success: false,
    //     error: "Address note is empty. Please input Address note",
    //   });

    // if (empty(nameTag))
    //   return res.status(400).json({
    //     success: false,
    //     error: "Name tag is empty. Please input Address name tag",
    //   });

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(200)
        .json({ success: false, error: "User does not exist." });

    const addressDB = await Address.findOne({ address: address });
    if (!addressDB)
      return res.status(200).json({
        success: false,
        error: "Error! Invalid address.",
      });

    // check if this Address is already created with note
    for (let i = 0; i < user.addressNotes.length; i++) {
      if (user.addressNotes[i].address === address)
        return res.status(200).json({
          success: false,
          error: "Error! Address private note already exist.",
        });
    }
    const adsNote = {
      address: address,
      note: addressNote,
      nameTag: nameTag,
      createdAt: new Date(),
    };
    user.addressNotes.push(adsNote);

    User.updateOne(
      {
        $or: [{ name: username }, { email: username }],
      },
      user,
      { upsert: true, setDefaultsOnInsert: true },
      function (err) {
        if (err) {
          return res.status(500).json({
            success: false,
            error:
              "Sorry for failed Address note saving into database failed. Please try again",
          });
        }

        return res.status(200).json({
          success: true,
          addressNotes: formatDate(
            paginate(sortByDate(user.addressNotes), pageNum, pageSize)
          ),
          addressNote: adsNote,
          totalCount: user.addressNotes.length,
          msg: "Successfully Added new address private note",
        });
      }
    );
    // return res.status(200).json({ success: true, user: user });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

// read address notes from database
exports.getAddressNotes = async (req, res) => {
  var username, pageNum, pageSize;
  try {
    username = req.body.name;
    pageNum = req.body.pageNum || defaultPageNum;
    pageSize = req.body.pageSize || defaultPageSize;

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: "User does not exist." });

    return res.status(200).json({
      success: true,
      addressNotes: formatDate(
        paginate(sortByDate(user.addressNotes), pageNum, pageSize)
      ),
      totalCount: user.addressNotes.length,
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

// get single address note
exports.getSingleAddressNote = async (req, res) => {
  var username, address;
  try {
    username = req.body.name;
    address = req.body.address;
    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: "User does not exist." });

    // check if it is the existing Address with not and return it if exist
    for (let i = 0; i < user.addressNotes.length; i++) {
      if (user.addressNotes[i].address === address)
        return res.status(200).json({
          success: true,
          addressNote: user.addressNotes[i],
        });
    }

    return res.status(200).json({
      success: false,
      error: "Note for this Address was not created yet.",
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

// edit a address note
exports.editAddressNote = async (req, res) => {
  var username, address, addressNote, nameTag, pageNum, pageSize;
  try {
    username = req.body.name;
    address = req.body.address;
    addressNote = req.body.addressNote;
    nameTag = req.body.nameTag;
    pageNum = req.body.pageNum || defaultPageNum;
    pageSize = req.body.pageSize || defaultPageSize;

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: "User does not exist." });

    var isExist = false;

    // check if it is the existing Address with not and return it if exist
    for (let i = 0; i < user.addressNotes.length; i++) {
      if (user.addressNotes[i].address === address) {
        isExist = !isExist;
        user.addressNotes[i].note = addressNote;
        user.addressNotes[i].nameTag = nameTag;
        user.addressNotes[i].createdAt = new Date();
        User.updateOne(
          {
            $or: [{ name: username }, { email: username }],
          },
          user,
          { upsert: true, setDefaultsOnInsert: true },
          function (err) {
            if (err) {
              return res.status(500).json({
                success: false,
                error:
                  "Sorry for failed Address note saving into database failed. Please try again",
              });
            }
            return res.status(200).json({
              success: true,
              addressNotes: formatDate(
                paginate(sortByDate(user.addressNotes), pageNum, pageSize)
              ),
              addressNote: user.addressNotes[i],
              msg: "Address Tag updated successfully",
            });
          }
        );
      }
    }
    if (!isExist) {
      return res.status(404).json({
        success: false,
        error: "Can not find note for such Address. Please check again",
      });
    }
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

// delete a address note
exports.deleteAddressNote = async (req, res) => {
  var username, address, pageNum, pageSize;
  try {
    username = req.body.name;
    address = req.body.address;
    pageNum = req.body.pageNum || defaultPageNum;
    pageSize = req.body.pageSize || defaultPageSize;

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: "User does not exist." });

    // check if it is the existing Address with not and return it if exist
    isExist = false;
    for (let i = 0; i < user.addressNotes.length; i++) {
      if (user.addressNotes[i].address === address) {
        isExist = true;
        if (i > -1) {
          user.addressNotes.splice(i, 1);
        }

        User.updateOne(
          {
            $or: [{ name: username }, { email: username }],
          },
          user,
          { upsert: true, setDefaultsOnInsert: true },
          function (err) {
            if (err) {
              return res.status(500).json({
                success: false,
                error: "Sorry for failed deletion. Please try again",
              });
            }
            return res.status(200).json({
              success: true,
              addressNotes: formatDate(
                paginate(sortByDate(user.addressNotes), pageNum, pageSize)
              ),
              addressNote: {},
              msg: "Address Tag Removed",
              totalCount: user.addressNotes.length,
            });
          }
        );
      }
    }

    if (!isExist) {
      return res.status(404).json({
        success: false,
        error: "Can not find such Address hash. Please check again",
      });
    }
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

// create a note for address
exports.createIgnoreToken = async (req, res) => {
  var username, token, tokenNote, pageNum, pageSize;
  try {
    username = req.body.name;
    token = req.body.token;
    tokenNote = req.body.tokenNote;
    pageNum = req.body.pageNum || defaultPageNum;
    pageSize = req.body.pageSize || defaultPageSize;

    if (empty(tokenNote))
      return res.status(200).json({
        success: false,
        error: "token note is empty. Please input token note",
      });

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(200)
        .json({ success: false, error: "User does not exist." });

    const tokenDB = await Token.findOne({ address: token });
    if (!tokenDB)
      return res.status(200).json({
        success: false,
        error: "token does not exist. Please check the token hash again",
      });

    // check if this token is already created with note
    for (let i = 0; i < user.tokenNotes.length; i++) {
      if (user.tokenNotes[i].token === token)
        return res.status(200).json({
          success: false,
          error:
            "This token already has note. To change that edit the existing note",
        });
    }
    user.tokenNotes.push({
      token: token,
      note: tokenNote,
      name: username,
      createdAt: new Date(),
    });

    User.updateOne(
      {
        $or: [{ name: username }, { email: username }],
      },
      user,
      { upsert: true, setDefaultsOnInsert: true },
      function (err) {
        if (err) {
          return res.status(200).json({
            success: false,
            error:
              "Sorry for failed token note saving into database failed. Please try again",
          });
        }

        return res.status(200).json({
          success: true,
          tokenNotes: formatDate(
            paginate(sortByDate(user.tokenNotes), pageNum, pageSize)
          ),
        });
      }
    );
    // return res.status(200).json({ success: true, user: user });
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message });
  }
};

// read token notes from database
exports.getIgnoreTokens = async (req, res) => {
  var username, pageNum, pageSize;
  try {
    username = req.body.name;
    pageNum = req.body.pageNum || defaultPageNum;
    pageSize = req.body.pageSize || defaultPageSize;

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: "User does not exist." });

    return res.status(200).json({
      success: true,
      tokenNotes: formatDate(
        paginate(sortByDate(user.tokenNotes), pageNum, pageSize)
      ),
      totalCount: user.tokenNotes.length,
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

// get single token note
exports.getSingleIgnoreToken = async (req, res) => {
  var username, token;
  try {
    username = req.body.name;
    token = req.body.token;
    pageNum = req.body.pageNum || defaultPageNum;
    pageSize = req.body.pageSize || defaultPageSize;

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: "User does not exist." });

    // check if it is the existing token with not and return it if exist
    for (let i = 0; i < user.tokenNotes.length; i++) {
      if (user.tokenNotes[i].token === token)
        return res.status(200).json({
          success: true,
          tokenNote: user.tokenNotes[i],
        });
    }

    return res.status(404).json({
      success: false,
      error: "Note for this token was not created yet.",
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

// edit a token note
exports.editIgnoreToken = async (req, res) => {
  var username, token, tokenNote, pageNum, pageSize;
  try {
    username = req.body.name;
    token = req.body.token;
    tokenNote = req.body.tokenNote;
    pageNum = req.body.pageNum || defaultPageNum;
    pageSize = req.body.pageSize || defaultPageSize;

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: "User does not exist." });

    var isExist = false;

    // check if it is the existing token with not and return it if exist
    for (let i = 0; i < user.tokenNotes.length; i++) {
      if (user.tokenNotes[i].token === token) {
        isExist = !isExist;
        user.tokenNotes[i].note = tokenNote;
        user.tokenNotes[i].createdAt = new Date();
        User.updateOne(
          {
            $or: [{ name: username }, { email: username }],
          },
          user,
          { upsert: true, setDefaultsOnInsert: true },
          function (err) {
            if (err) {
              return res.status(500).json({
                success: false,
                error:
                  "Sorry for failed token note saving into database failed. Please try again",
              });
            }
            return res.status(200).json({
              success: true,
              tokenNotes: formatDate(
                paginate(sortByDate(user.tokenNotes), pageNum, pageSize)
              ),
            });
          }
        );
      }
    }
    if (!isExist) {
      return res.status(404).json({
        success: false,
        error: "Can not find note for such token. Please check again",
      });
    }
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

// delete a token note
exports.deleteIgnoreToken = async (req, res) => {
  var username, token, pageNum, pageSize;
  try {
    username = req.body.name;
    token = req.body.token;
    pageNum = req.body.pageNum || defaultPageNum;
    pageSize = req.body.pageSize || defaultPageSize;

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: "User does not exist." });

    // check if it is the existing token with not and return it if exist
    isExist = false;
    for (let i = 0; i < user.tokenNotes.length; i++) {
      if (user.tokenNotes[i].token === token) {
        isExist = true;
        if (i > -1) {
          user.tokenNotes.splice(i, 1);
        }

        User.updateOne(
          {
            $or: [{ name: username }, { email: username }],
          },
          user,
          { upsert: true, setDefaultsOnInsert: true },
          function (err) {
            if (err) {
              return res.status(500).json({
                success: false,
                error: "Sorry for failed deletion. Please try again",
              });
            }
            return res.status(200).json({
              success: true,
              tokenNotes: formatDate(
                paginate(sortByDate(user.tokenNotes), pageNum, pageSize)
              ),
            });
          }
        );
      }
    }

    if (!isExist) {
      return res.status(404).json({
        success: false,
        error: "Can not find such token hash. Please check again",
      });
    }
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

// create a note for address
exports.createCustomABI = async (req, res) => {
  var username, abi, contractAddress, contractName, pageNum, pageSize;
  try {
    username = req.body.name;
    abi = req.body.abi;
    contractAddress = req.body.contractAddress;
    contractName = req.body.contractName;
    pageNum = req.body.pageNum || defaultPageNum;
    pageSize = req.body.pageSize || defaultPageSize;

    if (empty(contractAddress))
      return res.status(400).json({
        success: false,
        error: "contract address is empty. Please input contract address",
      });

    if (empty(contractName))
      return res.status(400).json({
        success: false,
        error: "contract Name is empty. Please input contract name",
      });

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: "User does not exist." });

    var contract = await Contract.findOne({
      address: contractAddress,
    });
    if (!contract)
      return res
        .status(404)
        .json({ success: false, error: "Contract does not exist." });

    // check if this abi is already created with note
    for (let i = 0; i < user.customABIs.length; i++) {
      if (user.customABIs[i].contractAddress === contractAddress)
        return res.status(400).json({
          success: false,
          error:
            "This contract already has note. To change that edit the existing note",
        });
    }
    user.customABIs.push({
      abi: abi,
      contractAddress: contractAddress,
      contractName: contractName,
      createdAt: new Date(),
    });

    User.updateOne(
      {
        $or: [{ name: username }, { email: username }],
      },
      user,
      { upsert: true, setDefaultsOnInsert: true },
      function (err) {
        if (err) {
          return res.status(500).json({
            success: false,
            error:
              "Sorry for failed abi saving into database failed. Please try again",
          });
        }

        return res.status(200).json({
          success: true,
          customABIs: formatDate(
            paginate(sortByDate(user.customABIs), pageNum, pageSize)
          ),
        });
      }
    );
    // return res.status(200).json({ success: true, user: user });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

// read abi notes from database
exports.getCustomABIs = async (req, res) => {
  var username, pageNum, pageSize;
  try {
    username = req.body.name;
    pageNum = req.body.pageNum || defaultPageNum;
    pageSize = req.body.pageSize || defaultPageSize;

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: "User does not exist." });

    return res.status(200).json({
      success: true,
      customABIs: formatDate(
        paginate(sortByDate(user.customABIs), pageNum, pageSize)
      ),
      totalCount: user.customABIs.length,
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

// get single abi note
exports.getSingleCustomABI = async (req, res) => {
  var username, contractAddress;
  try {
    username = req.body.name;
    contractAddress = req.body.contractAddress;

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: "User does not exist." });

    // check if it is the existing abi with not and return it if exist
    for (let i = 0; i < user.customABIs.length; i++) {
      if (user.customABIs[i].contractAddress === contractAddress)
        return res.status(200).json({
          success: true,
          customABI: user.customABIs[i],
        });
    }

    return res.status(404).json({
      success: false,
      error: "Note for this abi was not created yet.",
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

// edit a abi note
exports.editCustomABI = async (req, res) => {
  var username, abi, contractAddress, contractName, pageNum, pageSize;
  try {
    username = req.body.name;
    abi = req.body.abi;
    contractAddress = req.body.contractAddress;
    contractName = req.body.contractName;
    pageNum = req.body.pageNum || defaultPageNum;
    pageSize = req.body.pageSize || defaultPageSize;

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: "User does not exist." });

    var isExist = false;

    // check if it is the existing abi with not and return it if exist
    for (let i = 0; i < user.customABIs.length; i++) {
      if (user.customABIs[i].contractAddress === contractAddress) {
        isExist = !isExist;
        user.customABIs[i].abi = abi;
        user.customABIs[i].contractName = contractName;
        user.customABIs[i].createdAt = new Date();
        User.updateOne(
          {
            $or: [{ name: username }, { email: username }],
          },
          user,
          { upsert: true, setDefaultsOnInsert: true },
          function (err) {
            if (err) {
              return res.status(500).json({
                success: false,
                error:
                  "Sorry for failed custom abi saving into database failed. Please try again",
              });
            }
            return res.status(200).json({
              success: true,
              customABIs: formatDate(
                paginate(sortByDate(user.customABIs), pageNum, pageSize)
              ),
            });
          }
        );
      }
    }
    if (!isExist) {
      return res.status(404).json({
        success: false,
        error: "Can not find such contract. Please check again",
      });
    }
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

// delete a abi note
exports.deleteCustomABI = async (req, res) => {
  var username, contractAddress, pageNum, pageSize;
  try {
    username = req.body.name;
    contractAddress = req.body.contractAddress;
    pageNum = req.body.pageNum || defaultPageNum;
    pageSize = req.body.pageSize || defaultPageSize;

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: "User does not exist." });

    // check if it is the existing abi with not and return it if exist
    isExist = false;
    for (let i = 0; i < user.customABIs.length; i++) {
      if (user.customABIs[i].contractAddress === contractAddress) {
        isExist = true;
        if (i > -1) {
          user.customABIs.splice(i, 1);
        }

        User.updateOne(
          {
            $or: [{ name: username }, { email: username }],
          },
          user,
          { upsert: true, setDefaultsOnInsert: true },
          function (err) {
            if (err) {
              return res.status(500).json({
                success: false,
                error: "Sorry for failed deletion. Please try again",
              });
            }
            return res.status(200).json({
              success: true,
              customABIs: formatDate(
                paginate(sortByDate(user.customABIs), pageNum, pageSize)
              ),
            });
          }
        );
      }
    }

    if (!isExist) {
      return res.status(404).json({
        success: false,
        error: "Can not find such abi hash. Please check again",
      });
    }
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

// create a apiKey
exports.createApikey = async (req, res) => {
  var username, apiKeyName;
  try {
    username = req.body.name;
    apiKeyName = req.body.apiKeyName || "";

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(200)
        .json({ success: false, error: "User does not exist." });

    if (user.apiKeys !== undefined && user.apiKeys.length > 2) {
      return res.status(200).json({
        success: false,
        error:
          "This user has already more than 3 apiKeys. Not able to create anymore.",
      });
    }

    var { uuid } = uuidAPIKey.create();
    var apiKey = uuidAPIKey.toAPIKey(uuid, { noDashes: true });

    var apiType = await ApiKeyType.findOne({ type: 1 });
    var type = 1;
    var new_sec_call = 5;
    var new_hour_call = 100000;
    var new_pro_end = false;
    if (apiType) {
      new_sec_call = apiType.sec_call;
      new_hour_call = apiType.hour_call;
      new_pro_end = apiType.pro_end;
    }

    user.apiKeys.push({
      uuid: uuid,
      apiKey: apiKey,
      name: apiKeyName,
      type: type,
      sec_call: new_sec_call,
      hour_call: new_hour_call,
      pro_end: new_pro_end,
      createdAt: new Date(),
    });

    User.updateOne(
      {
        $or: [{ name: username }, { email: username }],
      },
      user,
      { upsert: true, setDefaultsOnInsert: true },
      function (err) {
        if (err) {
          return res.status(200).json({
            success: false,
            error:
              "Sorry for failed apiKey saving into database failed. Please try again",
          });
        }
        return res.status(201).json({
          success: true,
          apiKeys: sortByDate(user.apiKeys),
          totalCount: user.apiKeys.length,
        });
      }
    );
    // return res.status(200).json({ success: true, user: user });
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message });
  }
};

// read apiKeys from database
exports.getApikeys = async (req, res) => {
  var username;
  try {
    username = req.body.name;

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(200)
        .json({ success: false, error: "User does not exist." });

    return res.status(200).json({
      success: true,
      apiKeys: user.apiKeys,
      totalCount: user.apiKeys.length,
    });
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message });
  }
};

// get single apiKey
exports.getSingleApikey = async (req, res) => {
  var username, apiKey;
  try {
    username = req.body.name;
    apiKey = req.body.apiKey;

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: "User does not exist." });

    // check if it is the existing transaction with not and return it if exist
    for (let i = 0; i < user.apiKeys.length; i++) {
      if (user.apiKeys[i].apiKey === apiKey)
        return res.status(200).json({
          success: true,
          apiKeys: user.apiKeys[i],
        });
    }

    return res.status(200).json({
      success: false,
      error: "The apiKey does not exist.",
    });
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message });
  }
};

// edit a apiKey
exports.editApikey = async (req, res) => {
  var username, apiKey, apiKeyName;
  try {
    username = req.body.name;
    apiKey = req.body.apiKey;
    apiKeyName = req.body.apiKeyName;

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(200)
        .json({ success: false, error: "User does not exist." });

    var isExist = false;

    // check if it is the existing transaction with not and return it if exist
    for (let i = 0; i < user.apiKeys.length; i++) {
      if (user.apiKeys[i].apiKey === apiKey) {
        isExist = !isExist;

        user.apiKeys[i].name = apiKeyName;
        user.apiKeys[i].createdAt = new Date();
        User.updateOne(
          {
            $or: [{ name: username }, { email: username }],
          },
          user,
          { upsert: true, setDefaultsOnInsert: true },
          function (err) {
            if (err) {
              return res.status(200).json({
                success: false,
                error:
                  "Sorry for failed api key name saving into database failed. Please try again",
              });
            }
            return res.status(200).json({
              success: true,
              apiKeys: user.apiKeys,
            });
          }
        );
      }
    }

    if (!isExist) {
      return res.status(200).json({
        success: false,
        error: "Can not find such api key. Please check again",
      });
    }
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

// delete a apiKey
exports.deleteApikey = async (req, res) => {
  var username, apiKey;
  try {
    username = req.body.name;
    apiKey = req.body.apiKey;

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, error: "User does not exist." });

    // check if it is the existing transaction with not and return it if exist
    isExist = false;
    for (let i = 0; i < user.apiKeys.length; i++) {
      if (user.apiKeys[i].apiKey === apiKey) {
        isExist = true;
        if (i > -1) {
          user.apiKeys.splice(i, 1);
        }

        User.updateOne(
          {
            $or: [{ name: username }, { email: username }],
          },
          user,
          { upsert: true, setDefaultsOnInsert: true },
          function (err) {
            if (err) {
              return res.status(500).json({
                success: false,
                error: "Sorry for failed deletion. Please try again",
              });
            }
            return res.status(200).json({
              success: true,
              apiKeys: user.apiKeys,
            });
          }
        );
      }
    }

    if (!isExist) {
      return res.status(200).json({
        success: false,
        error: "Can not find such api key. Please check again",
      });
    }
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message });
  }
};

const getAddressWatchListCnt = (addressWatchList) => {
  return 0;
};

const getEmailLimitCnt = (addressWatchList) => {
  return 0;
};

const getTotalBalance = async (addressWatchList) => {
  var totalBalance = 0;
  for (let i = 0; i < addressWatchList.length; i++) {
    let address = await Address.findOne({
      address: addressWatchList[i].watchAddress,
    });
    console.log(address.balance);
    let balance = address.balance || 0;
    totalBalance += parseInt(balance);
    console.log("totalBalance", totalBalance);
  }
  return totalBalance;
};

const getLastLogin = (user) => {
  return 0;
};

// read apiKeys from database
exports.getOverview = async (req, res) => {
  var username,
    name,
    email,
    addressWatchListAlertCnt,
    txnNotesCnt = 0,
    addressTagsCnt = 0,
    emailLimitCnt = 0,
    totalBalance = 0,
    lastLogin;
  try {
    username = req.body.name;

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(200)
        .json({ success: false, error: "User does not exist." });

    name = user.name;
    email = user.email;
    addressWatchListAlertCnt =
      getAddressWatchListCnt(user.addressWatchList) || 0;
    txnNotesCnt = user.txnNotes.length || 0;
    addressTagsCnt = user.addressNotes.length || 0;
    emailLimitCnt = getEmailLimitCnt(user.addressWatchList) || 0;

    for (let i = 0; i < user.addressWatchList.length; i++) {
      address = await Address.findOne({
        address: user.addressWatchList[i].watchAddress,
      });
      console.log("address", address);
      console.log("address.balance", address.balance);
      balance = address.balance || 0;
      totalBalance = totalBalance + balance;
      console.log("totalBalance", totalBalance);
    }

    lastLogin = user.loginTimes[user.loginTimes.length - 1] || 0;

    return res.status(200).json({
      success: true,
      name: name,
      email: email,
      addressWatchListAlertCnt: addressWatchListAlertCnt,
      txnNotesCnt: txnNotesCnt,
      addressTagsCnt: addressTagsCnt,
      emailLimitCnt: emailLimitCnt,
      totalBalance: totalBalance,
      lastLogin: lastLogin,
    });
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message });
  }
};

//change profile info
exports.changeProfile = async (req, res) => {
  const { error, isValid } = validateProfileInput(req.body);
  // Check validation
  if (!isValid) {
    return res.status(200).json({ succeed: false, error: error });
  }
  User.findOne({ name: req.body.name }).then((user) => {
    if (user.email !== req.body.email) {
      return res.status(200).json({
        succeed: false,
        message: "Email is incorrect",
      });
    } else {
      if (!Validator.isEmpty(req.body.password)) {
        if (!bcrypt.compareSync(req.body.oldPassword, user.password)) {
          return res.status(200).json({
            succeed: false,
            error: "Error! Your old password does not match.",
          });
        } else {
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req.body.password, salt, async (err, hash) => {
              if (err) throw err;
              await User.updateOne({ name: req.body.name }, { password: hash });
            });
          });
        }
      }
      User.updateOne(
        { name: req.body.name },
        {
          profilename: req.body.profileName,
          image: req.body.profileImage,
          bio: req.body.profileBio,
          website: req.body.profileWebsite,
        },
        { upsert: true, setDefaultsOnInsert: true },
        function (err) {
          if (err) {
            return res.status(200).json({
              success: false,
              error: "Sorry for failed deletion. Please try again",
            });
          }
          return res.status(200).json({
            succeed: true,
            message: "Account information updated successfully",
          });
        }
      );
    }
  });
};

// read apiKeys from database
exports.getUserAccountSettings = async (req, res) => {
  var username, name, email;
  try {
    username = req.body.name;

    var user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });
    if (!user)
      return res
        .status(200)
        .json({ success: false, error: "User does not exist." });

    name = user.name;
    email = user.email;

    return res.status(200).json({
      success: true,
      name: name,
      email: email,
    });
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message });
  }
};

// Update apiKeys
exports.updateApikeys = async (req, res) => {
  var userName = req.body.name;
  var verifyAmount = req.body.verifyAmount;
  var orderID = req.body.orderID;
  var type = req.body.type;

  try {
    var apiKeyType = await ApiKeyType.findOne({ type: type });

    var paypalBodyData =
      constants.PAYPAL_BODYKEY + "=" + constants.PAYPALBODY_VALUE;

    // get paypal access token
    axios({
      method: "post",
      url: constants.PAYPAL_URL,
      data: paypalBodyData, // => this is mandatory x-www-form-urlencoded. DO NOT USE json format for this
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded", // => needed to handle data parameter
        "Accept-Language": "en_US",
      },
      auth: {
        username: process.env.PAYPAL_USERNAME,
        password: process.env.PAYPAL_PASSWORD,
      },
    })
      .then((loginRes) => {
        let access_token = loginRes.data.access_token;
        console.log("access_token", access_token);

        // get paypal order detail
        axios({
          method: "get",
          url: constants.TRANSACTION_URL + orderID,
          data: paypalBodyData, // => this is mandatory x-www-form-urlencoded. DO NOT USE json format for this
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json", // => needed to handle data parameter
            "Accept-Language": "en_US",
            Authorization: "Bearer" + access_token,
          },
          auth: {
            username: process.env.PAYPAL_USERNAME,
            password: process.env.PAYPAL_PASSWORD,
          },
        })
          .then(async (data) => {
            let amount =
              data.data.purchase_units[0].payments.captures[0].amount.value;
            console.log("amout: " + amount);

            if (amount !== verifyAmount)
              return res.json({
                success: false,
                error: "You have to pay enacted money",
              });

            User.findOne({
              name: userName,
            })
              .then(async (response) => {
                let userInfo = response;

                for (let i = 0; i < userInfo.apiKeys.length; i++) {
                  let new_sec_call = apiKeyType.sec_call;
                  let new_hour_call = apiKeyType.hour_call;
                  let new_pro_end = apiKeyType.pro_end;

                  userInfo.apiKeys[i] = {
                    ...userInfo.apiKeys[i],
                    type: apiKeyType,
                    sec_call: new_sec_call,
                    hour_call: new_hour_call,
                    pro_end: new_pro_end,
                  };
                }

                User.updateOne({ name: userName }, userInfo, {
                  upsert: true,
                })
                  .then((data) => {
                    return res.json({ success: true });
                  })
                  .catch((err) => {
                    return res.json({ success: false, error: err.message });
                  });
              })
              .catch((err) => {
                return res.json({ success: false, error: err.message });
              });
          })
          .catch((err) => {
            return res.json({ success: false, error: err.message });
          });
      })
      .catch((err) => {
        return res.json({ success: false, error: err.message });
      });
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message });
  }
};
