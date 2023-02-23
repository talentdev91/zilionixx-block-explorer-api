const Token = require("../models/TokenModel");
const InputDataDecoder = require("ethereum-input-data-decoder");

const SaveToken = async function (tokenInfo, logStream) {
  var addr;
  console.log("SaveToken");

  try {
    addr = await Token.updateOne({ address: tokenInfo.address }, tokenInfo, {
      upsert: true,
      setDefaultsOnInsert: true,
    });
  } catch (err) {
    return false;
  }

  return true;
};

module.exports = { SaveToken };
