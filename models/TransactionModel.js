var mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

var Schema = mongoose.Schema;

var TransactionSchema = new Schema({
  blockHash: { type: String, required: true, lowercase: true },
  blockNumber: { type: Number, required: true },
  contractAddress: { type: String, lowercase: true },
  cumulativeGasUsed: { type: Number },
  from: { type: String, required: true, lowercase: true },
  gas: { type: Number, required: true },
  gasPrice: { type: String, required: true },
  gasUsed: { type: Number },
  hash: { type: String, required: true, lowercase: true },
  input: { type: String, required: true },
  logs: { type: Array },
  logsBloom: { type: String },
  nonce: { type: Number, required: true },
  r: { type: String, required: true },
  s: { type: String, required: true },
  status: { type: Boolean },
  to: { type: String, required: true, lowercase: true },
  transactionHash: { type: String, lowercase: true, lowercase: true },
  transactionIndex: { type: Number, required: true },
  v: { type: String, required: true },
  value: { type: Number, required: true },
  token: { type: Object },
  timestamp: { type: Number, required: true },
});

TransactionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Transaction", TransactionSchema);
