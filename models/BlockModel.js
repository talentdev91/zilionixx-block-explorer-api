var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var BlockSchema = new Schema({
  difficulty: { type: String, required: true },
  extraData: { type: String, required: true },
  gasLimit: { type: Number, required: true },
  gasUsed: { type: Number, required: true },
  hash: { type: String, required: true, lowercase: true },
  logsBloom: { type: String, required: true },
  miner: { type: String, required: true },
  mixHash: { type: String, required: true },
  nonce: { type: String, required: true },
  number: { type: Number, required: true },
  parentHash: { type: String, required: true, lowercase: true },
  receiptsRoot: { type: String, required: true },
  sha3Uncles: { type: String, required: true },
  size: { type: Number, required: true },
  stateRoot: { type: Number, required: true },
  timestamp: { type: Number, required: true },
  timestampNano: { type: String, required: true },
  totalDifficulty: { type: String, required: true },
  transactions: { type: Array, required: true },
  transactionsRoot: { type: String, required: true },
  uncles: { type: Array, required: true },
  blockReward: { type: Number, default: 0 },
});

module.exports = mongoose.model("Block", BlockSchema);
