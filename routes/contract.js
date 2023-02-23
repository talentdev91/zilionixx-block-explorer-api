var express = require("express");
const ContractController = require("../controllers/ContractController");
const multer = require("multer");
var fs = require("fs");

const storageJson = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(req.params);
    // var appDir = path.dirname(require.main.filename);
    var address = req.params.address;
    console.log("address", address);

    if (address) {
      var uploadPath = "./uploads/solidity/json/" + address;
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath + "/contract", { recursive: true });
      }
      cb(null, uploadPath + "/contract");
    } else {
      return res.status(100).json({
        success: false,
        error: "File upload failed. Check if you select address correctly",
      });
    }
  },
  filename: function (req, file, cb) {
    if (file) {
      if (file.originalname.endsWith(".json")) cb(null, file.originalname);
      else
        return res.status(400).json({
          success: false,
          error: "Invalid file extension. Only .json files are acceptable.",
        });
    } else
      return res.status(400).json({
        success: false,
        error: "File upload failed. Check if you added file correctly",
      });
  },
});

const uploadJson = multer({ storage: storageJson });
var router = express.Router();

// @route    GET api/v1/contract/verifyContract/solidity/single
// @desc     Verify a single solidity smart contract file
// @access   Public

router.post(
  "/contract/verifyContract/solidity/single",
  ContractController.verifySingleSolidityContract
);

router.post(
  "/contract/verifyContract/solidity/multi",
  ContractController.verifyMultiSolidityContract
);
router.post(
  "/contract/verifyContract/solidity/standardJson",
  ContractController.verifyStandardJsonSolidityContract
);
router.post(
  "/contract/verifyContract/solidity/upload/standardJson/:address",
  uploadJson.single("File"),
  ContractController.uploadStandardJsonSolidityContract
);

// router.post(
//   "/contract/verifyContract/solidity/multiUpload",
//   ContractController.VerifyMultiSolidityContractupload
// );

module.exports = router;
