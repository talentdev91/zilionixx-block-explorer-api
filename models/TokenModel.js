var mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

var Schema = mongoose.Schema;

var TokenSchema = new Schema({
  type: { type: String }, //ERC-20. ERC-721 ... ...
  address: { type: String, lowercase: true },
  symbol: { type: String },
  name: { type: String },
  logo: { type: String },
  decimals: { type: Number },
  totalSupply: { type: Number },
  isShown: {type: String },
  //uploaded token information
  tokenInformation: {type: Array},

  // email: { type: String },
  // requestorName: { type: String },
  // officialSiteUrl: { type: String },
  // logoIcon: { type: String },
  // projectDescription: { type: String },
  // officialContactEmail: { type: String },
  // blogLink: { type: String },
  // redditLink: { type: String },
  // slackDiscordLink: { type: String },
  // facebookLink: { type: String },
  // twitterLink: { type: String },
  // bitcoinLink: { type: String },
  // githubLink: { type: String },
  // telegramLink: { type: String },
  // whitepaperLink: { type: String },
  // priceDataCoinTiker: { type: String },
  // comments: { type: String },
  // checked: { type: Number, default: 0 },
  // selectedImage: { type: String },
  // priceUrl: { type: String },
  // marketCapUrl: { type: String },
});

TokenSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Token", TokenSchema);
