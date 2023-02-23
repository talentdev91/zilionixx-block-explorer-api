var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var SyncDaemonsStatusSchema = new Schema(
  {
    id: { type: Number, required: true },
    syncType: { type: String, required: true },
    syncBlockNo: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SyncDaemonsStatus", SyncDaemonsStatusSchema);
