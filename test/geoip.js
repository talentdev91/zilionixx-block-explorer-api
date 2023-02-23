var geoip = require("geoip-country");
const Log = require("../models/LogModel");
require("dotenv").config();

// DB connection
var mongoDB = "mongodb://192.168.112.109:27017/zilionixx_db";
var ip = "207.97.227.239";
var geo = geoip.lookup(ip);
console.log(geo);
var mongoose = require("mongoose");
mongoose
  .connect(mongoDB, {
    user: "zilionixxapi",
    pass: "zilionixxapi123@",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    //don't show the log when it is test
    if (process.env.NODE_ENV !== "test") {
      console.log("Connected to %s", mongoDB);
      console.log("MongoDB is connected ... \n");
    }
    var nonSyncIps = async function () {
      var ips = await Log.find({
        $and: [{ ip: { $exists: true } }, { country: null }],
      });

      for (let i = 0; i < ips.length; i++) {
        var geo = geoip.lookup(ips[i].ip);
        if (geo === null || geo.country === undefined) continue;
        var country = geo.country;
        console.log(country);
        await Log.updateOne(
          { ip: ips[i] },
          { country: country },
          {
            upsert: true,
            setDefaultsOnInsert: true,
          }
        );
      }
    };
    nonSyncIps();
  })
  .catch((err) => {
    console.error("App starting error:", err.message);
    process.exit(1);
  });
