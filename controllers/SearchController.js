const Transaction = require("../models/TransactionModel");
const Block = require("../models/BlockModel");
const Token = require("../models/TokenModel");
const Account = require("../models/AddressModel");
const type = require("../config/searchtype.json");

exports.getSearch = async (req, res) => {
  console.log(req.query);
  const search = req.query.searchIndex.toLowerCase();
  console.log("this is searchIndex", search.length, typeof search, search);
  var hashval;
  var result;
  var addressval;
  try {
    if (search.length === 66) {
      hashval = await Transaction.find(
        {
          hash: search,
        },
        { _id: 0, hash: 1 }
      ).lean();
      if (hashval.length > 0) {
        result = {
          type: type.transaction,
          searchResult: hashval[0].hash,
        };
      } else {
        hashval = await Block.find(
          {
            hash: search,
          },
          { _id: 0, hash: 1 }
        ).lean();
        result = {
          type: type.transaction,
          searchResult: hashval[0].hash,
        };
      }
    } else {
      console.log("here is preaddress", search);
      if (search.length === 42) {
        addressval = await Token.find(
          {
            address: search,
          },
          { _id: 0, address: 1 }
        ).lean();
        console.log(addressval);
        if (addressval > 0) {
          result = {
            type: type.token,
            searchResult: addressval[0].address,
          };
          console.log("here is token page");
        } else {
          console.log("here is address page", search);
          addressval = await Account.find(
            {
              address: search,
            },
            { _id: 0, address: 1 }
          ).lean();
          console.log("here is address page", addressval);

          result = {
            type: type.address,
            searchResult: addressval[0].address,
          };
        }
      } else {
        addressval = await Block.find(
          {
            number: search,
          },
          { _id: 0, number: 1 }
        ).lean();
        result = {
          type: type.block,
          searchResult: addressval[0].number,
        };
      }
    }

    res.status(200).json({
      searchResult: result,
    });
  } catch (err) {
    console.log("get detail of search error" + err);
    res.json({
      searchResult: 0,
    });
  }
};
