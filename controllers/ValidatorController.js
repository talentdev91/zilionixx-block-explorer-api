const Validator = require("../models/ValidatorModel");

exports.getValidatorsTopLeaderboard = async (req, res) => {
  const page = parseInt(req.query.page) + 1;
  const rowsPerPage = parseInt(req.query.rowsPerPage);
  const skipIndex = (page - 1) * rowsPerPage;
  const { orderBy, order } = JSON.parse(req.query.sortStatus);

  var sortQuery;

  if (orderBy === "Id") {
    sortQuery = { id: order };
  } else if (orderBy === "Self-Stacked") {
    sortQuery = { selfStake: order };
  } else if (orderBy === "Total Staked") {
    sortQuery = { receivedStake: order };
  } else if (orderBy === "Delegated") {
    sortQuery = { delegated: order };
  }

  try {
    const validatorsTopLeaderboardCnt = await Validator.count();

    const validatorsTopLeaderboard = await Validator.find()
      .lean()
      .sort(sortQuery)
      .limit(rowsPerPage)
      .skip(skipIndex);

    res.status(200).json({
      validatorsTopLeaderboard: validatorsTopLeaderboard,
      validatorsTopLeaderboardCnt: validatorsTopLeaderboardCnt,
    });
  } catch (err) {
    console.log("get validators top leaderboard error" + err);
  }
};
