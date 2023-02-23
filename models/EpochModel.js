var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var EpochSchema = new Schema({
  epoch: { type: Number, required: true },
  endTime: { type: Number, required: true },
  epochFee: { type: Number, required: true },
  totalBaseRewardWeight: { type: Number, required: true },
  totalTxRewardWeight: { type: Number, required: true },
  totalRewardPerSecond: { type: Number, required: true },
  totalStake: { type: Number, required: true },
  totalSupply: { type: Number, required: true },
});

module.exports = mongoose.model("Epoch", EpochSchema);
