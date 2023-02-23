const { argvInit } = require("../utils/ArgParser");

module.exports = Object.freeze({
  COUNT_OF_ACCOUNT: argvInit.coa,
  TRANSACTION_INTERVAL: argvInit.ti,
  CUSTOM_CHAIN: {
    MAINNET: "mainnet",
    NAME: argvInit.cn,
    CHAIN_ID: argvInit.cid,
    HARDFORK: argvInit.hf,
  },
  VALUE_IN_ETHER: argvInit.val,
  DIRECTION: argvInit.dir,
  WEB3_PROVIDER: argvInit.w3p,
  TRANSACTION_CONFIRMATION_BLOCKS: argvInit.tcb,
  STARTER_ACCOUNT: argvInit.starter,
  STARTER_ACCOUNT_KEY: argvInit.starterkey,
  STARTUP_DISTRIBUTE_VALUE: argvInit.sdv,
  GAS_PRICE: argvInit.gp,
  GAS_LIMIT: argvInit.gl,
  CONFIRM_SENDING_STRING:
    "******************************************\n\
  Do you want to send the signed value transaction now ? (Y/N):",
});
