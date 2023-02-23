const Epoch = require("../models/EpochModel");
const BlockchainStatus = require("../models/BlockchainStatusModel");
exports.getEpochs = async (req, res) => {
  const page = parseInt(req.query.page) + 1;
  const rowsPerPage = parseInt(req.query.rowsPerPage);
  const skipIndex = (page - 1) * rowsPerPage;
  const { order } = JSON.parse(req.query.sortStatus);
  var totalEpochCnt = 0;
  try {
    totalEpochCnt = await Epoch.count();
    const epochs = await Epoch.find()
      .lean()
      .sort({ epoch: order })
      .limit(rowsPerPage)
      .skip(skipIndex);

    res.status(200).json({
      epochs: epochs,
      totalEpochCnt: totalEpochCnt,
    });
  } catch (err) {
    console.log("get detail of Epochs error" + err);
  }
};

exports.epochDetail = async (req, res) => {
  var epochNumber = req.params.epochNumber;
  var isNumber = /^\d+$/.test(epochNumber);
  var findByEpochNumberQry;
  if (isNumber) {
    findByEpochNumberQry = { epoch: epochNumber };
  } else {
    findByEpochNumberQry = { epoch: epochNumber };
  }

  try {
    const blockchainStatus = await BlockchainStatus.findOne().lean().sort({
      updatedAt: -1,
    });
    const lastEpochNumber = blockchainStatus.epoch_syncno;
    const epoch = await Epoch.findOne(findByEpochNumberQry).lean();
    res.status(200).json({
      success: true,
      epoch: epoch,
      lastEpochNumber: lastEpochNumber,
    });
  } catch (err) {
    console.log("get epoch detail error" + err);
  }
};
