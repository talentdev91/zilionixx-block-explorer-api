var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var TokenInfoSchema = new Schema({
  email: { type: String },
  name: { type: String },
  contract: { type: String },
  official: { type: String },
  logo: { type: String },
  description: { type: String },
  officialcontract: { type: String },
  blog: { type: String },
  reddit: { type: String },
  slack: { type: String },
  facebook: { type: String },
  twitter: { type: String },
  bitcoin: { type: String },
  github: { type: String },
  telegram: { type: String },
  whitepaper: { type: String },
  ticker: { type: String },
  comment: { type: String },
  checked: { type: Number, default: 0 },
  selectedImage: { type: String },
});

module.exports = mongoose.model("TokenInfo", TokenInfoSchema);
