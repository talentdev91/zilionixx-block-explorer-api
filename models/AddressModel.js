var mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

var Schema = mongoose.Schema;

var AccountSchema = new Schema({
  type: { type: String, required: true },
  address: { type: String, required: true, lowercase: true },
  name: { type: String },
  balance: { type: Number, required: true },
  holdingTokens: { type: Array },
  globalNameTag: { type: String },
  transactionCount: {
    send: {
      type: Number,
      default: 0,
    },
    receive: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
  },
});

AccountSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Account", AccountSchema);
