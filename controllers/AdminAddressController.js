const Account = require("../models/AddressModel");

exports.createAddress = async (req, res) => {
  result = req.body;

  const account = new Account({
    address: result.address,
    name: result.name,
    balance: result.balance,
    type: result.addressType,
  });

  const createAddress = await account.save();
  res.status(201).json(createAddress);
};
