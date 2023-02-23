var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var EmailTypeSchema = new Schema(
    {
        type: {type:Number, required: true},
        description: { type: String, required: true },
        emails: { type: Array, required: true },
    },
);

module.exports = mongoose.model("emailtype", EmailTypeSchema);
