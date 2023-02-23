const { constants } = require("../config/constants");
const User = require("../models/UserModel");

module.exports = async function (req, res, next) {
  const apikey = req.query.apikey;
  const module = req.query.module;
  const action = req.query.action;

  if (!apikey) {
    //Make sure the token is valid[...]
    return res.status(200).send({
      message: "Missing Api key",
      success: false,
    });
  } else if (!module || !constants.APIS.MODULE.includes(module)) {
    return res.status(200).send({
      message: "Missing module or wrong module",
      success: false,
    });
  } else if (
    !action ||
    !Object.values(constants.APIS.ACTION_TYPES).includes(action)
  ) {
    return res.status(200).send({
      message: "Missing action or invalid action",
      success: false,
    });
  } else {
    const apiKey = await User.findOne({ "apiKeys.apiKey": apikey });

    if (apiKey) {
      next();
    } else {
      return res.status(200).send({
        message: "Invalid api key",
        success: false,
      });
    }
  }
};
