var mongoose = require("mongoose");

var LogSchema = new mongoose.Schema(
  {
    route: { type: String, required: true, default: "/" },
    ip: { type: String, required: false },
    country: { type: String, required: false },
    domain: { type: String, required: false }, // what the request was asked for such as block controller, txn controller, address controller and so on its return value will be "block", "address", "token", ...
    groupDomain: { type: String, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Log", LogSchema);
