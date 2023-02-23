var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ContractSchema = new Schema({
  address: { type: String, required: true, lowercase: true },
  creationCode: { type: String, required: true },
  sourceCode: { type: Object },
  compiler: { type: String },
  optimization: { type: Boolean },
  abi: { type: String },
  library: { type: Array },
  optimizerRuns: { type: Number },
  evmVersion: { type: String },
  licenseType: { type: String },
  isVerified: { type: Boolean, default: false },
});

module.exports = mongoose.model("Contract", ContractSchema);
