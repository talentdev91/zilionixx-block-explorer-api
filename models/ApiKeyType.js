var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ApiKeyTypeSchema = new Schema(
    {
        type: { type: Number, required: true },
        sec_call: { type: Number, required: true },
        hour_call: { type: Number, required: true },
        pro_end: { type: Boolean, required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("apikeytype", ApiKeyTypeSchema);
