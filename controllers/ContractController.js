const Web3 = require("web3");
const path = require("path");
const fs = require("fs-extra");
//import models
const Contract = require("../models/ContractModel");
const Transaction = require("../models/TransactionModel");

var solc = require("solc");
const { constants } = require("../config/constants");

const processBytecode = (bytecode) => {
  console.log("Inside processing bytecode...", constants.SOLIDITY_CBOR);
  for (const cborType in constants.SOLIDITY_CBOR) {
    console.log("cborType", cborType);
    console.log(
      "constants.SOLIDITY_CBOR[cborType]",
      constants.SOLIDITY_CBOR[cborType]
    );
    var endingPoint = bytecode.search(constants.SOLIDITY_CBOR[cborType]);
    console.log("endingPoint", endingPoint);

    if (endingPoint > 0) return bytecode.slice(0, endingPoint);
  }

  return false;
};

exports.verifySingleSolidityContract = async (req, res) => {
  console.log("INside verify single solidity contract");
  try {
    const address = req.body.address;
    const compiler = req.body.compiler;
    const optimization = req.body.optimization === "yes";
    const sourceCode = req.body.sourceCode;
    const optimizerRuns = parseInt(req.body.optimizerRuns);
    const evmVersion = req.body.evmVersion;
    const licenseType = req.body.licenseType;
    const constructorArguments = req.body.constructorArguments;
    const library1Name = req.body.library1Name;
    const library1Address = req.body.library1Address;
    const library2Name = req.body.library2Name;
    const library2Address = req.body.library2Address;
    const library3Name = req.body.library3Name;
    const library3Address = req.body.library3Address;
    const library4Name = req.body.library4Name;
    const library4Address = req.body.library4Address;
    const library5Name = req.body.library5Name;
    const library5Address = req.body.library5Address;
    const library6Name = req.body.library6Name;
    const library6Address = req.body.library6Address;
    const library7Name = req.body.library7Name;
    const library7Address = req.body.library7Address;
    const library8Name = req.body.library8Name;
    const library8Address = req.body.library8Address;
    const library9Name = req.body.library9Name;
    const library9Address = req.body.library9Address;
    const library10Name = req.body.library10Name;
    const library10Address = req.body.library10Address;

    console.log("address", address);
    var contract = await Contract.findOne({
      address: address,
    });
    console.log(contract);
    if (contract) {
      var txn = await Transaction.findOne({ contractAddress: address });
      var blockchain_bytecode = contract.creationCode;
      if (blockchain_bytecode === null) {
        return res
          .status(404)
          .json({ error: "No such contract address was found" });
      }

      solc.loadRemoteVersion(compiler, async function (err, solcSnapshot) {
        if (err) {
          console.log("error");

          // An error was encountered, display and quit
          return res.status(401).json({ error: err.message });
        } else {
          console.log("No error");
          // NOTE: Use `solcSnapshot` here with the same interface `solc` has
          var input = {
            language: "Solidity",
            sources: {
              "compiling.sol": {
                content: sourceCode,
              },
            },
            settings: {
              optimizer: {
                enabled: optimization,
                runs: optimizerRuns,
              },
              evmVersion: evmVersion,

              outputSelection: {
                "*": {
                  "*": ["evm.bytecode", "evm.deployedBytecode", "abi"],
                },
              },
            },
          };

          var output = JSON.parse(
            solcSnapshot.compile(JSON.stringify(input), null, "\t")
          );
          if (output.errors !== undefined) {
            return res
              .status(200)
              .json({ success: false, error: output.errors[0].message });
          }
          var processed_blockchain_bytecode =
            processBytecode(blockchain_bytecode);
          var contractNames = [];
          for (var contractName in output.contracts["compiling.sol"]) {
            contractNames.push(contractName);
            try {
              var bytecodeOfContractName =
                "0x" +
                output.contracts["compiling.sol"][contractName].evm.bytecode
                  .object;
              var processed_compiled_bytecode = processBytecode(
                bytecodeOfContractName
              );
              // compare only runtime code
              if (
                processed_blockchain_bytecode === processed_compiled_bytecode
              ) {
                if (
                  blockchain_bytecode.length === bytecodeOfContractName.length
                ) {
                  bytecode_verified = true;
                  console.log("Bytecode Verified!");
                  var output_abi =
                    output.contracts["compiling.sol"][contractName].abi;
                  await Contract.updateOne(
                    {
                      address: address,
                    },
                    {
                      sourceCode: { single: sourceCode },
                      compiler: compiler,
                      optimization: optimization,
                      abi: JSON.stringify(output_abi),
                      library: [
                        {
                          libraryName: library1Name,
                          libraryAddress: library1Address,
                        },
                        {
                          libraryName: library2Name,
                          libraryAddress: library2Address,
                        },
                        {
                          libraryName: library2Name,
                          libraryAddress: library2Address,
                        },
                        {
                          libraryName: library3Name,
                          libraryAddress: library3Address,
                        },
                        {
                          libraryName: library4Name,
                          libraryAddress: library4Address,
                        },
                        {
                          libraryName: library5Name,
                          libraryAddress: library5Address,
                        },
                        {
                          libraryName: library6Name,
                          libraryAddress: library6Address,
                        },
                        {
                          libraryName: library7Name,
                          libraryAddress: library7Address,
                        },
                        {
                          libraryName: library8Name,
                          libraryAddress: library8Address,
                        },
                        {
                          libraryName: library9Name,
                          libraryAddress: library9Address,
                        },
                        {
                          libraryName: library10Name,
                          libraryAddress: library10Address,
                        },
                      ],
                      optimizerRuns: optimizerRuns,
                      evmVersion: evmVersion,
                      licenseType: licenseType,
                      isVerified: true,
                    },
                    {
                      upsert: true,
                      setDefaultsOnInsert: true,
                    }
                  );
                  return res.status(200).json({
                    success: true,
                    txn: txn.hash,
                    address: address,
                    compilerVersion: compiler,
                    optimization: optimization,
                    optimizerRuns: optimizerRuns,
                    contractNames: contractNames,
                    constructorArguments: constructorArguments,
                    abi: output_abi,
                    contractName: contractName,
                    bytecode: bytecodeOfContractName,
                  });
                } else {
                  // in case constructor arguments exist
                  var blockchain_constructor_arguments =
                    blockchain_bytecode.slice(bytecodeOfContractName.length);
                  // check if the verifier provided constructor arguments
                  if (constructorArguments) {
                    if (
                      blockchain_constructor_arguments === constructorArguments
                    ) {
                      var output_abi =
                        output.contracts["compiling.sol"][contractName].abi;
                      await Contract.updateOne(
                        {
                          address: address,
                        },
                        {
                          sourceCode: { single: sourceCode },
                          compiler: compiler,
                          optimization: optimization,
                          abi: JSON.stringify(output_abi),
                          library: library,
                          optimizerRuns: optimizerRuns,
                          evmVersion: evmVersion,
                          licenseType: licenseType,
                          isVerified: true,
                          constructorArguments:
                            blockchain_constructor_arguments,
                        },
                        {
                          upsert: true,
                          setDefaultsOnInsert: true,
                        }
                      );
                      return res.status(200).json({
                        success: true,
                        contractName: contractName,
                        bytecode: bytecodeOfContractName,
                        constructorArguments: blockchain_constructor_arguments,
                        success: true,
                        txn: txn.hash,
                        address: address,
                        compilerVersion: compiler,
                        optimization: optimization,
                        optimizerRuns: optimizerRuns,
                        contractNames: contractNames,
                        abi: output_abi,
                      });
                    } else {
                      return res.status(200).json({
                        success: false,
                        error: "Constructor arguments does not match",
                      });
                    }
                  } else {
                    return res.status(200).json({
                      success: false,
                      error: "No constructor arguments supported",
                    });
                  }
                }
              }
            } catch (err) {
              console.log(err.message);
              return res.json({
                error: err.message,
              });
            }
          }
          return res.status(400).json({
            success: false,
            error: "Not verified",
          });
        }
      });
    } else {
      return res
        .status(404)
        .json({ success: false, error: "This is invalid contract address" });
    }
  } catch (err) {
    return res.status(404).json({ success: false, error: err.message });
  }
};

exports.verifyMultiSolidityContract = async (req, res) => {
  try {
    const address = req.body.address;
    const compiler = req.body.compiler;
    const optimization = req.body.optimization === "true";
    const optimizerRuns = parseInt(req.body.optimizerRuns);
    const evmVersion = req.body.evmVersion;
    const constructorArguments = req.body.constructorArguments;

    const buildPath = path.resolve(
      __dirname,
      "../uploads/solidity/" + address + "/build"
    );
    fs.removeSync(buildPath);

    const contractPath = path.resolve(
      __dirname,
      "../uploads/solidity/" + address + "/contracts"
    );
    const fileNames = fs.readdirSync(contractPath);

    const compilerInput = {
      language: "Solidity",
      sources: fileNames.reduce((input, fileName) => {
        const filePath = path.resolve(contractPath, fileName);
        const source = fs.readFileSync(filePath, "utf8");
        return { ...input, ["contracts/" + fileName]: { content: source } };
      }, {}),
      settings: {
        optimizer: {
          enabled: optimization,
          runs: optimizerRuns,
        },
        evmVersion: evmVersion,
        outputSelection: {
          "*": {
            "*": ["abi", "evm.bytecode.object"],
          },
        },
      },
    };

    var blockchain_bytecode =
      "0x608060405234801561001057600080fd5b50604051610809380380610809833981810160405281019061003291906100d5565b3360405161003f906100b3565b610049919061010d565b604051809103906000f080158015610065573d6000803e3d6000fd5b50600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550806001819055505061017b565b6102ba8061054f83390190565b6000815190506100cf81610164565b92915050565b6000602082840312156100e757600080fd5b60006100f5848285016100c0565b91505092915050565b61010781610128565b82525050565b600060208201905061012260008301846100fe565b92915050565b60006101338261013a565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b61016d8161015a565b811461017857600080fd5b50565b6103c58061018a6000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c806318160ddd146100465780632e64cec1146100645780636057361d14610082575b600080fd5b61004e61009e565b60405161005b91906102ed565b60405180910390f35b61006c6100a4565b60405161007991906102ed565b60405180910390f35b61009c6004803603810190610097919061022b565b6100ad565b005b60015481565b60008054905090565b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16630a2eb301336040518263ffffffff1660e01b815260040161010891906102b2565b60206040518083038186803b15801561012057600080fd5b505afa158015610134573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101589190610202565b610197576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161018e906102cd565b60405180910390fd5b806000819055507f93fe6d397c74fdf1402a8b72e47b68512f0510d7b98a4bc4cbdf6ac7108b3c59816040516101cd91906102ed565b60405180910390a150565b6000815190506101e781610361565b92915050565b6000813590506101fc81610378565b92915050565b60006020828403121561021457600080fd5b6000610222848285016101d8565b91505092915050565b60006020828403121561023d57600080fd5b600061024b848285016101ed565b91505092915050565b61025d81610319565b82525050565b6000610270600c83610308565b91507f556e617574686f72697a656400000000000000000000000000000000000000006000830152602082019050919050565b6102ac81610357565b82525050565b60006020820190506102c76000830184610254565b92915050565b600060208201905081810360008301526102e681610263565b9050919050565b600060208201905061030260008301846102a3565b92915050565b600082825260208201905092915050565b600061032482610337565b9050919050565b60008115159050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b61036a8161032b565b811461037557600080fd5b50565b61038181610357565b811461038c57600080fd5b5056fea2646970667358221220b3ba394c8008030b9192fb660f2f0637f646e6b403e919f355dee1364d0da3b064736f6c63430008000033608060405234801561001057600080fd5b506040516102ba3803806102ba8339818101604052810190610032919061008d565b806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550506100ff565b600081519050610087816100e8565b92915050565b60006020828403121561009f57600080fd5b60006100ad84828501610078565b91505092915050565b60006100c1826100c8565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6100f1816100b6565b81146100fc57600080fd5b50565b6101ac8061010e6000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c80630a2eb30114610030575b600080fd5b61004a600480360381019061004591906100ce565b610060565b6040516100579190610106565b60405180910390f35b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16149050919050565b6000813590506100c88161015f565b92915050565b6000602082840312156100e057600080fd5b60006100ee848285016100b9565b91505092915050565b61010081610133565b82525050565b600060208201905061011b60008301846100f7565b92915050565b600061012c8261013f565b9050919050565b60008115159050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b61016881610121565b811461017357600080fd5b5056fea264697066735822122032251aa1eaf579d3b18fc2307b61bb2ed06be766918defbb3db9216b9cd839ba64736f6c6343000800003300000000000000000000000000000000000000000000000000000000069f6bc7";

    // Compile All contracts

    solc.loadRemoteVersion(compiler, function (err, solcSnapshot) {
      if (err) {
        // An error was encountered, display and quit\
        console.log("error: ", err);
      } else {
        console.log("No error");

        // NOTE: Use `solcSnapshot` here with the same interface `solc` has
        var output = JSON.parse(
          solcSnapshot.compile(JSON.stringify(compilerInput), null, "\t")
        );

        for (let fileName in fileNames) {
          var compiledFile =
            output.contracts["contracts/" + fileNames[fileName]];
          for (let contractName in compiledFile) {
            var bytecodeOfContractName =
              "0x" + compiledFile[contractName].evm.bytecode.object;
            var blockchainRuntimeCode = blockchain_bytecode.slice(
              0,
              bytecodeOfContractName.length
            );

            if (blockchainRuntimeCode === bytecodeOfContractName) {
              if (blockchain_bytecode.length === bytecodeOfContractName) {
                return res.status(200).json({
                  success: true,
                  contractName: contractName,
                  bytecode: bytecodeOfContractName,
                });
              } else {
                var blockchain_constructor_arguments =
                  blockchain_bytecode.slice(bytecodeOfContractName.length);

                if (constructorArguments) {
                  if (
                    blockchain_constructor_arguments === constructorArguments
                  ) {
                    return res.status(200).json({
                      success: true,
                      contractName: contractName,
                      bytecode: bytecodeOfContractName,
                      constructorArguments: blockchain_constructor_arguments,
                    });
                  } else {
                    return res.status(200).json({
                      success: false,
                      error: "Constructor arguments does not match",
                    });
                  }
                } else {
                  return res.status(200).json({
                    success: false,
                    error: "No constructor arguments supported",
                  });
                }
              }
            }
          }
        }

        return res.status(400).json({
          error: "Not verified",
        });
      }
    });
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
};

exports.verifyStandardJsonSolidityContract = async (req, res) => {
  try {
    const address = req.body.address;
    const compiler = req.body.compiler;
    const constructorArguments = req.body.constructorArguments;
    var txn;
    if (address) {
      var contract = await Contract.findOne({
        address: address,
      });
      if (contract === null || contract === undefined || contract === {}) {
        return res.status(401).json({
          success: false,
          error: "This contract address does not exist.",
        });
      }
      txn = await Transaction.findOne({ contractAddress: address });
    } else {
      return res
        .status(401)
        .json({ success: false, error: "Please input contract address" });
    }
    var blockchain_bytecode = contract.creationCode;

    if (compiler) {
      const buildPath = path.resolve(
        __dirname,
        "../uploads/solidity/json/" + address + "/build"
      );
      fs.removeSync(buildPath);

      const contractPath = path.resolve(
        __dirname,
        "../uploads/solidity/json/" + address + "/contract"
      );
      const fileNames = fs.readdirSync(contractPath);
      var contractMetadata;
      if (fileNames.length === 0)
        return res.status(404).json({
          success: false,
          error: "No json file uploaded. Please upload again.",
        });
      contractMetadata = fileNames[0];
      var contractMetadataJson = JSON.parse(
        fs.readFileSync(contractPath + "/" + contractMetadata, "utf8")
      );
      var sourceCode = {};
      if (contractMetadataJson.sources !== undefined) {
        for (const file in contractMetadataJson.sources) {
          sourceCode[file] = contractMetadataJson["sources"][file]["content"];
        }
      }
      contractMetadataJson.settings = {
        ...contractMetadataJson.settings,
        outputSelection: {
          "*": {
            "*": ["abi", "evm.bytecode.object"],
          },
        },
      };

      // Compile All contracts
      solc.loadRemoteVersion(compiler, async function (err, solcSnapshot) {
        if (err) {
          // An error was encountered, display and quit\
          console.log("error: ", err);
        } else {
          console.log("No error");

          // NOTE: Use `solcSnapshot` here with the same interface `solc` has
          var output = JSON.parse(
            solcSnapshot.compile(
              JSON.stringify(contractMetadataJson),
              null,
              "\t"
            )
          );
          var contractNames = [];
          for (let fileName in contractMetadataJson.sources) {
            var compiledFile = output.contracts[fileName];
            for (let contractName in compiledFile) {
              contractNames.push(contractName);
            }
          }
          for (let fileName in contractMetadataJson.sources) {
            var compiledFile = output.contracts[fileName];
            for (let contractName in compiledFile) {
              console.log(contractName);
              var bytecodeOfContractName =
                "0x" +
                compiledFile[contractName].evm.bytecode.object +
                constructorArguments;

              if (bytecodeOfContractName === blockchain_bytecode) {
                var output_abi = output.contracts[fileName][contractName].abi;
                let optimization =
                  contractMetadataJson.settings.optimizer.enabled;
                let optimizerRuns =
                  contractMetadataJson.settings.optimizer.runs;
                let evmVersion = contractMetadataJson.settings.evmVersion;
                let libraries = contractMetadataJson.settings.libraries;
                let library = [
                  {
                    libraryName: "",
                    libraryAddress: "",
                  },
                  {
                    libraryName: "",
                    libraryAddress: "",
                  },
                  {
                    libraryName: "",
                    libraryAddress: "",
                  },
                  {
                    libraryName: "",
                    libraryAddress: "",
                  },
                  {
                    libraryName: "",
                    libraryAddress: "",
                  },
                  {
                    libraryName: "",
                    libraryAddress: "",
                  },
                  {
                    libraryName: "",
                    libraryAddress: "",
                  },
                  {
                    libraryName: "",
                    libraryAddress: "",
                  },
                  {
                    libraryName: "",
                    libraryAddress: "",
                  },
                  {
                    libraryName: "",
                    libraryAddress: "",
                  },
                  {
                    libraryName: "",
                    libraryAddress: "",
                  },
                ];
                await Contract.updateOne(
                  {
                    address: address,
                  },
                  {
                    sourceCode,
                    compiler: compiler,
                    optimization: optimization,
                    abi: JSON.stringify(output_abi),
                    library: library,
                    optimizerRuns: optimizerRuns,
                    evmVersion: evmVersion,
                    isVerified: true,
                    constructorArguments: constructorArguments,
                  },
                  {
                    upsert: true,
                    setDefaultsOnInsert: true,
                  }
                );
                return res.status(200).json({
                  success: true,
                  txn: txn.hash,
                  address: address,
                  compilerVersion: compiler,
                  evmVersion: evmVersion,
                  optimization: optimization,
                  optimizerRuns: optimizerRuns,
                  contractNames: contractNames,
                  constructorArguments: constructorArguments,
                  abi: output_abi,
                  contractName: contractName,
                  bytecode: bytecodeOfContractName,
                });
              }
            }
            return res.status(200).json({
              success: false,
              error:
                "General compile error: Please check out information again - solidity version, standard json input file and constructor arguments.",
            });
          }
        }
      });
    } else {
      return res
        .status(200)
        .json({ success: false, error: "Please input compiler version" });
    }
  } catch (err) {
    return res.status(401).json({ success: false, error: err.message });
  }
};

exports.uploadStandardJsonSolidityContract = async (req, res) => {
  return res.status(200).json({
    success: true,
  });
};
