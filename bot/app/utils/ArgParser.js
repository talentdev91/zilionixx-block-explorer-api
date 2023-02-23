const { constants } = require("../../../config/constants");
//command description
const argvInit = require("yargs/yargs")(process.argv.slice(2))
  // .default({ wc: 10, tps: 1 })
  .default({
    cn: "OperaLocal",
    cid: 250,
    hf: "petersburg",
    w3p: constants.WEB3_PROVIDER,
    tcb: 1,
    starter: "0x8734cb972d36a740cc983d5515e160c373a4a016",
    starterkey:
      "bb01e8730998826499ed790d116aa5a634a0862636880f8d69cc3900fb35fe35",
    sdv: 0.01,
    gp: 1000000000,
    gl: 42000,
    coa: 1,
    dir: "12",
    val: 0.01,
  })
  .usage(
    "Usage: $0 --coa [int] --cn [string] --cid [int] --hf [hardfork] --w3p [web3 provider url] --tcb [int] --starter [hex] --starterkey [starter private key] --sdv [num] --gp [num] --gl [num]"
  )
  .example(
    "node ./$0 --coa 10 --cn OperaLocal --cid 250 --hf peterburg --w3p ws://192.168.112.82:7001 --tcb 1 --starter 0x8734cb972d36a740cc983d5515e160c373a4a016 --starterkey bb01e8730998826499ed790d116aa5a634a0862636880f8d69cc3900fb35fe35 --sdv 1 --gp 1000000000 --gl 21000",
    "create 10 * 2 accounts randomly and start sending transactions from starter account to first 10 accounts group"
  )
  .example(
    "npm run start -- --coa 10 --cn OperaLocal --cid 250 --hf peterburg --w3p ws://192.168.112.82:7001 --tcb 1 --starter 0x8734cb972d36a740cc983d5515e160c373a4a016 --starterkey bb01e8730998826499ed790d116aa5a634a0862636880f8d69cc3900fb35fe35 --sdv 1 --gp 1000000000 --gl 21000",
    "create 10 * 2 accounts randomly and start sending transactions from starter account to first 10 accounts group"
  )
  .demandOption([
    "starter",
    "starterkey",
    "coa",
    "cn",
    "cid",
    "w3p",
    "tcb",
    "sdv",
    "gp",
    "gl",
    "hf",
    "dir",
    "val",
  ])
  .alias("coa", "count-of-account")
  .alias("cn", "chain-name")
  .alias("cid", "chain-id")
  .alias("hf", "hardfork")
  .alias("w3p", "web3-provider")
  .alias("tcb", "transaction-confirmation-blocks")
  .alias("starter", "starter-account")
  .alias("starterkey", "starter-key-account")
  .alias("sdv", "startup-distribute-value")
  .alias("gp", "gasprice")
  .alias("gl", "gaslimit")
  .alias("dir", "direction")
  .alias("val", "value-in-ether")
  .help("h")
  .alias("h", "help")
  .epilog("copyright 2021").argv;

module.exports = { argvInit };
