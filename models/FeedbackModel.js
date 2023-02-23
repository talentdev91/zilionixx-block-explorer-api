var mongoose = require("mongoose");

var FeedbackSchema = new mongoose.Schema(
  {
    type: { type: Number, required: true, default: 1 }, // 1:General Inquiry, 2: Support?Technical Issue, 3: Name Tagging/Label Address, 4.Update TokenInfo
    data: { type: Object, required: true },
    receiveNotifyEmailSent: { type: Boolean },
    visible: { type: Boolean },
    reviewer: { type: String, required: false },
    isRead: { type: Boolean },
    response: { type: Array, required: false }, //save response that was sent to user via email
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", FeedbackSchema);
