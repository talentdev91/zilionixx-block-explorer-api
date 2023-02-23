var express = require("express");
const AdminController = require("../controllers/AdminController");
var router = express.Router();

// @route    POST api/v1/admin/saveUserFeedback
// @desc     Set a feedback
// @access   Public

router.post("/save", AdminController.saveUserFeedback);

module.exports = router;
