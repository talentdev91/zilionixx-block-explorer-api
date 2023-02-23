const Log = require("../models/LogModel");

module.exports = function (req, res, next) {
  var ip = req.ip;
  var route = req.originalUrl;
  ip = ip.toString().replace("::ffff:", "");
  Log.create({
    ip: ip,
    route: route,
  });
  next();
};
