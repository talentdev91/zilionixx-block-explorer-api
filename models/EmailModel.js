var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var EmailSchema = new Schema(
    {
        emailType: { type: Number, required: true },
        emailAddress: { type: Array, required: true },
        emailContent: { type: String, required: true },
        sendDate: {type: Date, required: true },
    },
);

module.exports = mongoose.model("email", EmailSchema);
