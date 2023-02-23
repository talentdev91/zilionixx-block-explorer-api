var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var PendingTransactionSchema = new Schema({
  hash: { type: String, required: true, lowercase: true },
  nonce: { type: Number, required: true },
  blockHash: { type: String, required: true, lowercase: true },
  blockNumber: { type: Number, required: true },
  transactionIndex: { type: Number, required: true },
  from: { type: String, required: true, lowercase: true },
  to: { type: String, required: true, lowercase: true },
  value: { type: String, required: true },
  gasPrice: { type: String, required: true },
  gas: { type: Number, required: true },
  input: { type: String, required: true },
  v: { type: String, required: true },
  r: { type: String, required: true },
  s: { type: String, required: true },
});

module.exports = mongoose.model("PendingTransaction", PendingTransactionSchema);
