var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var AdvertiseSchema = new Schema(
    {
        ad_url: { type: String, required: true },
        ad_link: { type: String, required: true },
        type: { type: Number, required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("advertise", AdvertiseSchema);
