const Epoch = require("../models/EpochModel");
const Validator = require("../models/ValidatorModel");
const Address = require("../models/AddressModel");
const sfcABI = require("./contractABIs/sfcABI.json");
const AddressType = require("../config/address.json");

const sfcAddress = "0xFC00FACE00000000000000000000000000000000";

const DoProcessSFC = async function (web3, epoch_syncno, logStream) {
  try {
    var contract = new web3.eth.Contract(sfcABI, sfcAddress);

    var sealedEpoch = await contract.methods.currentSealedEpoch().call();
    console.log(">>> sealedEpoch: ", sealedEpoch);

    if (epoch_syncno > sealedEpoch) {
      return { status: true, epoch_syncno: sealedEpoch };
    }

    var epochInfo = await contract.methods
      .getEpochSnapshot(epoch_syncno)
      .call();

    epochInfo = { epoch: epoch_syncno, ...epochInfo };
    console.log(">>> sync epoch number: ", epoch_syncno);

    epoch = await Epoch.updateOne({ epoch: epochInfo.epoch }, epochInfo, {
      upsert: true,
      setDefaultsOnInsert: true,
    });

    // get validator infos
    ret = await getValidators(web3, epoch_syncno, logStream);
    if (!ret) {
      console.log(">>> Can't get validator info");
      return { status: false, epoch_syncno: epoch_syncno };
    }
  } catch (err) {
    return false;
  }

  return { status: true, epoch_syncno: epoch_syncno };
};

const getValidators = async function (web3, epochno, logStream) {
  try {
    var contract = new web3.eth.Contract(sfcABI, sfcAddress);

    var validatorIDs = await contract.methods
      .getEpochValidatorIDs(epochno)
      .call();

    console.log("... epoch validator IDs: ", validatorIDs);

    await Validator.updateMany(
      { active: true },
      { active: false },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log("... update validator active status : ", docs);
        }
      }
    );

    for (var i = 0; i < validatorIDs.length; i++) {
      var id = validatorIDs[i];
      console.log(">>> sync validator IDs: ", id);

      var validatorInfo = await contract.methods.getValidator(id).call();
      var selfStake = await contract.methods.getSelfStake(id).call();
      validatorInfo = {
        ...validatorInfo,
        selfStake: selfStake,
        delegated: 0,
        id: id,
        active: true,
      };

      validator = await Validator.updateOne(
        { auth: validatorInfo.auth },
        validatorInfo,
        {
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      // save validator to address table
      const addrInfo = {
        type: AddressType.validator,
        address: validatorInfo.auth,
        balance: 0,
      };
      await SaveValidatorAddress(addrInfo);
    }
  } catch (err) {
    return false;
  }

  return true;
};

const SaveValidatorAddress = async function (addrInfo) {
  try {
    addr = await Address.updateOne({ address: addrInfo.address }, addrInfo, {
      upsert: true,
      setDefaultsOnInsert: true,
    });
  } catch (err) {
    console.log("save failed - validator info to address");
    return false;
  }
};
module.exports = { DoProcessSFC };
