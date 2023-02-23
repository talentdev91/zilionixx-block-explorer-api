var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var BlockchainStatusSchema = new Schema(
  {
    id: { type: Number, required: true },
    syncno: { type: Number, required: true },
    epoch_syncno: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BlockchainStatus", BlockchainStatusSchema);
