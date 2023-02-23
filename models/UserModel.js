var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    passwordConfirm: { type: String, required: false },
    role: { type: Number, default: 2 }, //role is 1 -> admin
    isConfirmed: { type: Number, default: 1 },
    confirmOTP: { type: String, required: false },
    otpTries: { type: Number, required: false, default: 0 },
    status: { type: Boolean, default: 1 },
    txnNotes: { type: Array, default: [] },
    addressWatchList: { type: Array, default: [] }, // notifyOption: 1: No notification, 2: Notify on Incoming & Outgoing Txns, 3: Notify on Incoming (Receive) Txns Only, 4: Notify on Outgoing (Sent) Txns Only ;;; trackERC20 type; boolean desc; Also Track ERC-20 Token Transfers or not
    addressNotes: { type: Array, default: [] },
    apiKeys: { type: Array, default: [] },
    tokenNotes: { type: Array, default: [] },
    customABIs: { type: Object, default: [] },
    profilename: { type: String, required: false },
    image: { type: String, required: false },
    bio: { type: String, required: false },
    website: { type: String, required: false },
    loginTimes: { type: Array, default: [] },
    isLoggedIn: { type: Boolean, default: false },
    newsLetterFlag: { type: Boolean, default: true },
    newsLetterDisableOption: { type: Number, default: 1 }, //1:  no longer want to receive these emails, 2: I never signed up for this mailing list, 3: The emails are inappropriate, 4: The emails are spam and should be reported, 5: Other
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
