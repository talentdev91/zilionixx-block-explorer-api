var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var EventModel = new Schema({
  keccak: { type: String, require: true },
  name: { type: String, require: true },
  inputs: { type: Array, require: true },
});

module.exports = mongoose.model("Event", EventModel);
