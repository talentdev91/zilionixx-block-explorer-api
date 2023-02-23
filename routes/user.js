var express = require("express");
const UserController = require("../controllers/UserController");
var router = express.Router();

// @route    POST api/v1/user/sandbox
// @desc     Tests User Router
// @access   Private

router.post("/sandbox", UserController.sandbox);

// @route    POST api/v1/user/addressWatchList/create
// @desc     Create a note for a txn
// @access   Private

router.post("/addressWatchList/create", UserController.createWatchAddress);

// @route    POST api/v1/user/addressWatchList/list
// @desc     List all notes a user created
// @access   Private

router.post("/addressWatchList/list", UserController.getWatchAddressList);

// @route    POST api/v1/user/addressWatchList/getOneWatchAddress
// @desc     Get single note from txn hash
// @access   Private

router.post(
  "/addressWatchList/getOneWatchAddress",
  UserController.getSingleWatchAddress
);

// @route    POST api/v1/user/addressWatchList/edit
// @desc     Get single note from txn hash
// @access   Private

router.post("/addressWatchList/edit", UserController.editWatchAddress);

// @route    POST api/v1/user/addressWatchList/delete
// @desc     Delete single note from txn hash
// @access   Private

router.post("/addressWatchList/delete", UserController.deleteWatchAddress);

// @route    POST api/v1/user/WatchAddress/create
// @desc     Create a note for a txn
// @access   Private

router.post("/txnNote/create", UserController.createTxnNote);

// @route    POST api/v1/user/txnNote/list
// @desc     List all notes a user created
// @access   Private

router.post("/txnNote/list", UserController.getTxnNotes);

// @route    POST api/v1/user/txnNote/getOneTxnNote
// @desc     Get single note from txn hash
// @access   Private

router.post("/txnNote/getOneTxnNote", UserController.getSingleNote);

// @route    POST api/v1/user/txnNote/edit
// @desc     Get single note from txn hash
// @access   Private

router.post("/txnNote/edit", UserController.editNote);

// @route    POST api/v1/user/txnNote/delete
// @desc     Delete single note from txn hash
// @access   Private

router.post("/txnNote/delete", UserController.deleteNote);

// @route    POST api/v1/user/addressNote/create
// @desc     Create a note for a txn
// @access   Private

router.post("/addressNote/create", UserController.createAddressNote);

// @route    POST api/v1/user/addressNote/list
// @desc     List all notes a user created
// @access   Private

router.post("/addressNote/list", UserController.getAddressNotes);

// @route    POST api/v1/user/addressNote/getOneAddressNote
// @desc     Get single note from txn hash
// @access   Private

router.post(
  "/addressNote/getOneAddressNote",
  UserController.getSingleAddressNote
);

// @route    POST api/v1/user/addressNote/edit
// @desc     Get single note from txn hash
// @access   Private

router.post("/addressNote/edit", UserController.editAddressNote);

// @route    POST api/v1/user/addressNote/delete
// @desc     Delete single note from txn hash
// @access   Private

router.post("/addressNote/delete", UserController.deleteAddressNote);

// @route    POST api/v1/user/addressNote/create
// @desc     Create a note for a txn
// @access   Private

router.post("/tokenIgnoreList/create", UserController.createIgnoreToken);

// @route    POST api/v1/user/tokenIgnoreList/list
// @desc     List all notes a user created
// @access   Private

router.post("/tokenIgnoreList/list", UserController.getIgnoreTokens);

// @route    POST api/v1/user/tokenIgnoreList/getOneIgnoreToken
// @desc     Get single note from txn hash
// @access   Private

router.post(
  "/tokenIgnoreList/getOneIgnoreToken",
  UserController.getSingleIgnoreToken
);

// @route    POST api/v1/user/tokenIgnoreList/edit
// @desc     Get single note from txn hash
// @access   Private

router.post("/tokenIgnoreList/edit", UserController.editIgnoreToken);

// @route    POST api/v1/user/tokenIgnoreList/delete
// @desc     Delete single note from txn hash
// @access   Private

router.post("/tokenIgnoreList/delete", UserController.deleteIgnoreToken);

// @route    POST api/v1/user/addressNote/create
// @desc     Create a note for a txn
// @access   Private

router.post("/customABIs/create", UserController.createCustomABI);

// @route    POST api/v1/user/customABIs/list
// @desc     List all notes a user created
// @access   Private

router.post("/customABIs/list", UserController.getCustomABIs);

// @route    POST api/v1/user/customABIs/getOneCustomABI
// @desc     Get single note from txn hash
// @access   Private

router.post("/customABIs/getOneCustomABI", UserController.getSingleCustomABI);

// @route    POST api/v1/user/customABIs/edit
// @desc     Get single note from txn hash
// @access   Private

router.post("/customABIs/edit", UserController.editCustomABI);

// @route    POST api/v1/user/customABIs/delete
// @desc     Delete single note from txn hash
// @access   Private

router.post("/customABIs/delete", UserController.deleteCustomABI);

// @route    POST api/v1/user/profile/update
// @desc     update profile
// @access   Private

// @route    POST api/v1/user/apikeys/create
// @desc     Create an apikey for the user
// @access   Private

router.post("/apikeys/create", UserController.createApikey);

// @route    POST api/v1/user/apikeys/list
// @desc     List all apikeys a user created
// @access   Private

router.post("/apikeys/list", UserController.getApikeys);

// @route    POST api/v1/user/apikeys/getOneTxnNote
// @desc     Get single apikey from txn hash
// @access   Private

router.post("/apikeys/getOneApikey", UserController.getSingleApikey);

// @route    POST api/v1/user/apikeys/edit
// @desc     Get single apikey from txn hash
// @access   Private

router.post("/apikeys/edit", UserController.editApikey);

// @route    POST api/v1/user/apikeys/delete
// @desc     Delete single apikey from txn hash
// @access   Private

router.post("/apikeys/delete", UserController.deleteApikey);

// @route    GET api/v1/user/overview
// @desc     get general information of user api
// @access   Private

router.post("/overview", UserController.getOverview);

// @route    GET api/v1/user/getAccountSetting
// @desc     get account setting of user api
// @access   Private

router.post("/accountSetting/get", UserController.getUserAccountSettings);

// @route    post api/v1/user/apikeys/paypal
// @desc     update apikeys
// @access   Private
router.post("/apikeys/paypal", UserController.updateApikeys);

router.post("/profile/update", UserController.changeProfile);
module.exports = router;
