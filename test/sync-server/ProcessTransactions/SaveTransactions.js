const TestTransaction = require("../../../models/TestTransactionModel");

const SaveTransactionWithForStmt = async function (txs, logStream) {
  console.log("Loading... Updating db with for statment");
  const txsLength = txs.length;
  for (var i = 0; i < txs.length; i++) {
    try {
      tx = await TestTransaction.updateOne({ hash: txs[i].hash }, txs[i], {
        upsert: true,
        setDefaultsOnInsert: true,
      });
      // await PendingTransaction.findOneAndDelete({ hash: txs[i].hash });
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  return true;
};

const SaveTransactionWithBulkWrite = async function (txs, logStream) {
  console.log("Loading... Updating db with BulkWrite");
  const txsLength = txs.length;
  var updateOps = [];
  for (var i = 0; i < txs.length; i++) {
    try {
      updateOp = {
        updateOne: {
          filter: { hash: txs[i].hash },
          update: txs[i],
          upsert: true,
        },
      };
      updateOps.push(updateOp);
      // tx = await TestTransaction.updateOne({ hash: txs[i].hash }, txs[i], {
      //   upsert: true,
      //   setDefaultsOnInsert: true,
      // });
      // await PendingTransaction.findOneAndDelete({ hash: txs[i].hash });
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  var txs = await TestTransaction.bulkWrite(updateOps);

  process.exit();
};

module.exports = { SaveTransactionWithForStmt, SaveTransactionWithBulkWrite };
