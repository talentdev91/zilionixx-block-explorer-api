var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ValidatorSchema = new Schema({
  id: { type: Number, required: true },
  status: { type: Number, required: true },
  deactivatedTime: { type: Number, required: true },
  deactivatedEpoch: { type: Number, required: true },
  selfStake: { type: Number, required: true },
  receivedStake: { type: Number, required: true },
  createdEpoch: { type: Number, required: true },
  createdTime: { type: Number, required: true },
  auth: { type: String, required: true, lowercase: true },
  active: { type: Boolean, required: true },
  delegated: { type: Number, required: true },
});

module.exports = mongoose.model("Validator", ValidatorSchema);
