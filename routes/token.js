var express = require("express");
const TokenController = require("../controllers/TokenController");

var router = express.Router();

// @route    GET api/v1/tx/test
// @desc     Tests Transaction Route
// @access   Public

router.get("/test", (req, res) => res.json({ msg: "Transaction works" }));

// @route    GET api/v1/token/erc20token
// @desc     Get erc20 tokens
// @access   Public

router.get("/tokens/:page/:rowsPerPage", TokenController.getErc20Token);

// @route    GET api/v1/token/erc771_inventory/:page/rowsPerPage
// @desc     Get erc721_inventories tokens
// @access   Public

router.get(
  "/tokens/erc721_inventory/:page/:rowsPerPage/:tokenAddress",
  TokenController.getErc721Inventory
);

// @route    GET api/v1/erc20Tokens/search/:keyword
// @desc     Search Erc20 tokens by address and name
// @access   Public

router.post("/erc20Tokens/search", TokenController.searchErc20Tokens);

// @route    GET api/v1/erc20Tokens/search/:keyword/:page/:rowsPerPage
// @desc     Search Erc20 tokens by address and name
// @access   Public

router.get(
  "/erc20Tokens/search/:keyword/:page/:rowsPerPage",
  TokenController.searchErc20TokensByPage
);

// @route    GET api/v1/tokentxns/:page/:rowsPerPage
// @desc     return token txns for page and rowsPerPage
// @access   Public

router.get("/tokentxns/:page/:rowsPerPage", TokenController.getErc20Transfer);

// @route    GET api/v1/tokendetail/:page/:rowsPerPage/:tokenAddress
// @desc     return tokendetail
// @access   Public

router.get(
  "/tokendetail/:page/:rowsPerPage/:tokenAddress",
  TokenController.getTokenDetail
);

// @route    post api/v1/tx/erc20Transactions/search/:address/:keyword
// @access   Public

router.post(
  "/erc20Tokens/searchTransaction", TokenController.getTokenDetailBySearch
);

// @route    GET api/v1/tokendetail/:tokenAddress
// @desc     return tokendetailinfo
// @access   Public

router.get(
  "/tokendetailinfo/:tokenAddress",
  TokenController.getTokenDetailInfo
);


// @route    GET api/v1/tokendetail/analyze/:tokenAddress
// @desc     return tokendetail analyze
// @access   Public

router.get("/tokendetail/analyze/:tokenAddress", TokenController.analyzeToken);

// @route    GET api/v1/tokenTransfers/:tokenAddress/search/:keyword/:page/:rowsPerPage
// @desc     Search paginated transfers by txn and transfer address
// @access   Public

router.get(
  "/tokenTransfers/:tokenAddress/search/:keyword/:page/:rowsPerPage",
  TokenController.getFilteredTransfers
);

router.get(
  "/tokenHolders/:page/:rowsPerPage/:tokenAddress/:tokenType",
  TokenController.getTokenHolders
);

router.get(
  "/topTokenHolders/:showCount/:tokenAddress",
  TokenController.getTopTokenHolders
);

// router.post("/newtoken", TokenController.createToken);
router.post("/createtokeninfo", TokenController.createTokenInfo);
router.get("/getTokenInfo", TokenController.getTokenInfo);
router.get("/getConfirmTokenInfo", TokenController.getConfirmTokenInfo);
router.put("/updateToken", TokenController.updateToken);
router.put("/updateManyToken", TokenController.upDateManytokens);
router.get("/tokens/gettoken", TokenController.getAdminToken);

// @route    GET api/v1/token-erc721/:page/:rowsPerPage
// @desc     Get erc721 tokens
// @access   Public
router.get("/token-erc721/:page/:rowsPerPage", TokenController.getErc721Token);
router.get(
  "/erc721Transfer/:page/:rowsPerPage",
  TokenController.getErc721Transfer
);

// @route    GET api/v1/tokenApprovals/:fromAddress
// @desc     Get all token approval transactions by address
// @access   Public

router.get("/tokenApprovals", TokenController.getTokenApprovalsByAddress);
router.delete("/deleteToken/:id", TokenController.deleteToken);

// @route    POST api/v1/token/balance-checker
// @desc     Get token balance information by time and block no
// @access   Public

router.post("/token/balance-checker", TokenController.getTokenBalance);

module.exports = router;
