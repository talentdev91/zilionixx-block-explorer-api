const ApiKeyType = require("../models/ApiKeyType");
const EmailTypes = require("../models/EmailTypesModel");
const GetDailyResult = require("../controllers/AdminController");

exports.InitializeDB = () => {
  testApiKeyModel();
  testEmailTypesModel();
};

async function testApiKeyModel() {
  let totalApikey = await ApiKeyType.countDocuments();

  if (totalApikey !== 4) {
    await ApiKeyType.deleteMany();

    await ApiKeyType.insertMany([
      { type: 1, sec_call: 5, hour_call: 100000, pro_end: "false" },
      { type: 2, sec_call: 10, hour_call: 200000, pro_end: "true" },
      { type: 3, sec_call: 20, hour_call: 500000, pro_end: "true" },
      { type: 4, sec_call: 30, hour_call: 1000000, pro_end: "true" },
    ]);
    console.log("Initialize ApikeyType Collection Success");
  }
}

async function testEmailTypesModel() {
  let countEmailTypes = await EmailTypes.countDocuments();

  if (!countEmailTypes || countEmailTypes === 0) {
    await EmailTypes.deleteMany();

    await EmailTypes.insertMany([
      {
        type: 1,
        description: "send the daily report",
        emails: ["ermoshinvladislav@gmail.com", "americadf0090@gmail.com"],
      },
    ]);
    console.log("Initialize EmailTypes Collection Success");
  }
}
