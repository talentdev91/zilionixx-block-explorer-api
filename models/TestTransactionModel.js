var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var TestTransactionSchema = new Schema({
  block: { type: Schema.Types.ObjectId, ref: "Block" },
  blockHash: { type: String, required: true },
  blockNumber: { type: Number, required: true },
  contractAddress: { type: String },
  cumulativeGasUsed: { type: Number },
  from: { type: String, required: true },
  gas: { type: Number, required: true },
  gasPrice: { type: String, required: true },
  gasUsed: { type: Number },
  hash: { type: String, required: true },
  input: { type: String, required: true },
  logs: { type: Array },
  logsBloom: { type: String },
  nonce: { type: Number, required: true },
  r: { type: String, required: true },
  s: { type: String, required: true },
  status: { type: Boolean },
  to: { type: String, required: true },
  transactionHash: { type: String },
  transactionIndex: { type: Number, required: true },
  v: { type: String, required: true },
  value: { type: String, required: true },
  token: { type: Object },
});

module.exports = mongoose.model("TestTransaction", TestTransactionSchema);
