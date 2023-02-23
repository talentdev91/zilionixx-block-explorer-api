//This controller is responsible for apis used for Admin page
const moment = require("moment");
const nanoid = require("nanoid");
var empty = require("is-empty");
var validateEmail = require("./utils/validateEmail");
const todayStart = moment().startOf("day").toDate();
const todayEnd = moment().endOf("day").toDate();
const Log = require("../models/LogModel");
const Feedback = require("../models/FeedbackModel");
const Advertise = require("../models/AdvertiseModel");
const Address = require("../models/AddressModel");
const Token = require("../models/TokenModel");
const { constants } = require("../config/constants");
const multer = require("multer");
var fs = require("fs");
var geoip = require("geoip-country");

exports.sandbox = async (req, res) => {
  return res.status(200).json({ success: true, data: req.body });
};

exports.listUserActivity = async (req, res) => {
  try {
    var totalRequestsCount = await Log.countDocuments();
    var todayRequestsCount = await Log.countDocuments({
      createdAt: {
        $gte: todayStart,
        $lte: todayEnd,
      },
    });
    var groupByIps = {
      $group: {
        _id: "$ip",
        count: {
          $sum: 1,
        },
        // ip: { $addToSet: "$ip" },
      },
    };
    var groupByCountry = {
      $group: {
        _id: "$country",
        count: {
          $sum: 1,
        },
      },
    };
    var sortByCount = {
      $sort: { count: -1 },
    };
    var limitResult = { $limit: 20 };

    var uniqueIps = await Log.aggregate([groupByIps, sortByCount, limitResult]);
    var topCountries = await Log.aggregate([groupByCountry, sortByCount]);
    var groupByDomains = {
      $group: {
        _id: "$groupDomain",
        count: {
          $sum: 1,
        },
        // ip: { $addToSet: "$ip" },
      },
    };
    var sortByCount = {
      $sort: { count: -1 },
    };
    var limitResult = { $limit: 20 };

    var topDomains = await Log.aggregate([
      groupByDomains,
      sortByCount,
      limitResult,
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalRequestsCount: totalRequestsCount,
        todayRequestsCount: todayRequestsCount,
        uniqueIps: uniqueIps,
        topDomains: topDomains,
        topCountries: topCountries,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

const nonSyncIps = async function () {
  var ips = await Log.find({
    $and: [{ ip: { $exists: true } }, { country: null }],
  });

  for (let i = 0; i < ips.length; i++) {
    var geo = geoip.lookup(ips[i].ip);
    if (geo === null || geo.country === undefined) continue;
    var country = geo.country;
    await Log.updateOne(
      { _id: ips[i]._id },
      { country: country },
      {
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );
  }
};

exports.extractRouter = async (req, res) => {
  try {
    var logs = await Log.find({
      $and: [
        { route: { $exists: true } },
        { $or: [{ domain: null }, { domain: "" }] },
      ],
    });

    for (let i = 0; i < logs.length; i++) {
      let route = logs[i].route;
      var domain = "";
      // check if private api or public api
      // private api starts with /api/v1/ and pulbic api startsWith /api/api
      if (route.startsWith("/api/v1/")) {
        let routePrefix = route.slice(8);
        domain = (routePrefix.split(/(\/|\?|\#)/) || [routePrefix])[0];
      } else if (route.startsWith("/api/api/")) {
        let routePrefix = route.slice(9);
        domain = (routePrefix.split(/.*?(\/|\?|\#)/) || [routePrefix])[0];
      }
      var groupDomain = domain;
      for (let gdName in constants.REQUEST_DOMAIN_GROUPS) {
        if (constants.REQUEST_DOMAIN_GROUPS[gdName].includes(domain)) {
          groupDomain = gdName;
        }
      }

      await Log.updateOne(
        { _id: logs[i].id },
        { domain: domain, groupDomain: groupDomain },
        {
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    nonSyncIps();

    return res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.saveUserFeedback = async (req, res) => {
  try {
    // For type: 1; General inquery, 2;
    const type = req.body.type;
    const data = req.body.data;
    if (![1, 2, 3].includes(type)) {
      return res
        .status(200)
        .json({ success: false, error: "Feedback type is incorrect" });
    }
    if (empty(data.name)) {
      return res
        .status(200)
        .json({ success: false, error: "Name field is empty" });
    }
    if (empty(data.email)) {
      return res
        .status(200)
        .json({ success: false, error: "Email field is empty" });
    }
    if (!validateEmail(data.email)) {
      return res
        .status(200)
        .json({ success: false, error: "Email is invalid" });
    }
    //For general inquerys type===1
    if (type === 1 || type === 2) {
      if (empty(data.message))
        return res
          .status(200)
          .json({ success: false, error: "Message field is empty" });
      Feedback.create({ type: type, data: data }, function (err) {
        if (err) {
          return res.status(200).json({ success: false, error: err.message });
        }
        return res.status(200).json({ success: true, error: "" });
      });
    }
    //For general dinquerys type = 3
    if (type === 3) {
      if (empty(data.comName))
        return res
          .status(200)
          .json({ success: false, error: "Company Name is Empty" });
      if (empty(data.comSite))
        return res
          .status(200)
          .json({ success: false, error: "Company Website is Empty" });
      if (empty(data.selectValue))
        return res
          .status(200)
          .json({ success: false, error: "User Own is Empty" });
      data.nameTag.map((contract, index) => {
        if (!contract.address) {
          return res
            .status(200)
            .json({ success: false, error: "Smart Contract Address is Empty" });
        }
        if (!contract.nameTag) {
          return res.status(200).json({
            success: false,
            error: "Smart Contract Name Tag is Empty",
          });
        }
        if (!contract.website) {
          return res
            .status(200)
            .json({ success: false, error: "Smart Contract Website is Empty" });
        }
        if (!contract.shortDesc) {
          return res.status(200).json({
            success: false,
            error: "Smart Contract Short Description is Empty",
          });
        }
      });
      Feedback.create({ type: type, data: data }, function (err) {
        if (err) {
          return res.status(200).json({ success: false, error: err.message });
        }
        return res.status(200).json({ success: true, error: "" });
      });
    }
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message });
  }
};

exports.listAllUserFeedback = async (req, res) => {
  try {
    var type = parseInt(req.params.type);
    var page = parseInt(req.params.page);
    var rowsPerPage = parseInt(req.params.rowsPerPage);
    const skipIndex = page * rowsPerPage;
    var feedbacks = await Feedback.find({ type: type, visible: null })
      .lean()
      .skip(skipIndex)
      .sort({ createdAt: -1 })
      .limit(rowsPerPage);
    var totalCount = await Feedback.countDocuments({ type: type });
    return res.status(200).json({
      success: true,
      data: { feedbacks: feedbacks, totalCount: totalCount },
      error: "",
    });
  } catch (err) {
    return res
      .status(200)
      .json({ success: false, error: err.message, data: null });
  }
};

// exports.getFeedbackStatistics = async (req, res) => {
//   try {
//     var feedbacks = await Feedback.find({ type: type, visible: null })
//       .lean()
//       .skip(skipIndex)
//       .sort({ createdAt: -1 })
//       .limit(rowsPerPage);

//     return res
//       .status(200)
//       .json({ success: true, data: { feedbacks: feedbacks }, error: "" });
//   } catch (err) {
//     return res
//       .status(200)
//       .json({ success: false, error: err.message, data: null });
//   }
// };

exports.closeUserFeedbacks = async (req, res) => {
  try {
    var feedbackIds = req.body.ids;
    if (feedbackIds.length === undefined)
      return res.status(200).json({
        success: false,
        data: null,
        error: "Feedback ids should be an array",
      });

    Feedback.updateMany(
      { _id: { $in: feedbackIds } },
      { $set: { visible: false } },
      { upsert: true, setDefaultsOnInsert: true },
      function (err) {
        if (err) {
          return res.status(200).json({
            success: false,
            error: "Feedback ids should be an array",
          });
        }
        return res.status(200).json({
          success: true,
          error: "",
        });
      }
    );
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message });
  }
};

exports.sendFeedbackResponseEmailToUser = async (req, res) => {
  try {
    var id = req.body.id;
    var response = req.body.response;
    if (empty(response))
      return res.status(200).json({
        success: false,
        data: null,
        error: "Response message couldn't be null",
      });
    var feedback = await Feedback.findOne({ _id: id });
    if (!feedback)
      return res
        .status(200)
        .json({ success: false, error: "There is not Feedback" });
    feedback.response.push({ content: response, sentAt: new Date() });

    Feedback.updateOne(
      { _id: id },
      {
        response: feedback.response,
        isRead: true,
      },
      { upsert: true, setDefaultsOnInsert: true },
      function (err) {
        if (err) {
          return res.status(200).json({
            success: false,
            error: "Feedback response saving failed",
          });
        }
        return res.status(200).json({
          success: true,
          error: "",
        });
      }
    );
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message });
  }
};

exports.updateNametag = async (req, res) => {
  try {
    var id = req.body.id;
    var data = req.body.data;
    var feedback = await Feedback.findOne({ _id: id });
    if (!feedback) {
      return res
        .status(200)
        .json({ success: false, error: "There is not Feedback" });
    }
    if (feedback.data.nameTag !== undefined) {
      if (feedback.data.nameTag.length > 0) {
        for (let i = 0; i < feedback.data.nameTag.length; i++) {
          var address = await Address.findOne({
            address: data[i].address,
            type: "contract",
          });
          if (!address) {
            return res
              .status(200)
              .json({ success: false, error: "There is no Contract Address" });
          }
          if (data[i].isApproved) {
            address.globalNameTag = data[i].nameTag;
            Address.updateOne(
              { address: data[i].address, type: "contract" },
              address,
              { upsert: true, setDefaultsOnInsert: true },
              function (err) {
                if (err) {
                  return res.status(200).json({
                    success: false,
                    error: "Name Tag is Invalid",
                  });
                }
              }
            );
          } else {
            address.globalNameTag = null;
            Address.updateOne(
              { address: data[i].address, type: "contract" },
              address,
              { upsert: true, setDefaultsOnInsert: true },
              function (err) {
                if (err) {
                  return res.status(200).json({
                    success: false,
                    error: "Name Tag is Invalid",
                  });
                }
              }
            );
          }
          feedback.data.nameTag[i] = {
            ...feedback.data.nameTag[i],
            isApproved: data[i].isApproved,
          };
          feedback.isRead = true;
        }
      }
    }
    Feedback.updateOne(
      { _id: id },
      feedback,
      { upsert: true, setDefaultsOnInsert: true },
      function (err) {
        if (err) {
          return res.status(200).json({
            success: false,
            error: "Name Tag is Invalid",
          });
        }
        return res.status(200).json({
          success: true,
          error: "",
        });
      }
    );
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message });
  }
};

exports.getAdvertise = async (req, res) => {
  try {
    var advertise = await Advertise.find();
    if (advertise) {
      return res
        .status(200)
        .json({ success: true, data: advertise, error: "" });
    } else {
      return res
        .status(200)
        .json({ success: false, data: {}, error: "There is no Advertise" });
    }
  } catch (err) {
    return res
      .status(200)
      .json({ success: false, error: err.message, data: null });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    var uploadPath = "./uploads/advertise/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, "uploads/advertise/");
  },
  // By default, multer removes file extensions so let's add them back
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

exports.createAdvertise = async (req, res) => {
  try {
    let upload = multer({ storage: storage }).single("file");
    upload(req, res, function (err) {
      if (req.fileValidationError) {
        return res.send(req.fileValidationError);
      } else if (!req.file) {
        return res.send("Please select an file to upload");
      } else if (err instanceof multer.MulterError) {
        return res.send(err);
      } else if (err) {
        return res.send(err);
      }
      var adLink = req.body.adLink;
      var type = req.body.type;
      Advertise.updateOne(
        {},
        {
          ad_url: `uploads/advertise/${req.file.originalname}`,
          ad_link: adLink,
          type: type,
        },
        { upsert: true, setDefaultsOnInsert: true },
        async function (err) {
          if (err) {
            return res.status(200).json({
              success: false,
              error: err.message,
            });
          }
          const adData = {
            adUrl: `uploads/advertise/${req.file.originalname}`,
            adLink: adLink,
            type: type,
          };
          return res
            .status(200)
            .json({ success: true, error: "", data: adData });
        }
      );
    });
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message, data });
  }
};

exports.updateAdvertise = async (req, res) => {
  try {
    var adUrl = req.body.adUrl;
    var adLink = req.body.adLink;
    var type = req.body.type;

    Advertise.updateOne(
      {},
      { ad_link: adLink },
      { upsert: true, setDefaultsOnInsert: true },
      async function (err) {
        if (err) {
          return res.status(200).json({
            success: false,
            error: err.message,
          });
        }
        const adData = { adUrl: adUrl, adLink: adLink, type: type };
        return res.status(200).json({ success: true, error: "", data: adData });
      }
    );
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message, data });
  }
};

exports.deleteAdvertise = async (req, res) => {
  var fs = require("fs");
  var adName = req.body.adName;
  try {
    Advertise.deleteOne({}, async function (err) {
      if (err) {
        return res.status(200).json({
          success: false,
          error: err.message,
        });
      }
      fs.unlinkSync(`uploads/advertise/${adName}`);
      return res.status(200).json({ success: true, error: "" });
    });
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message, data });
  }
};

exports.addTokenInfo = async (req, res) => {
  try {
    var tempID = nanoid.nanoid();
    var email = req.body.email;
    var name = req.body.name;
    var tokenAddress = req.body.tokenAddress;
    var officialUrl = req.body.officialUrl;
    var logoIcon = req.body.logoIcon;
    var description = req.body.description;
    var officialEmailAdd = req.body.officialEmailAdd;
    var blog = req.body.blog;
    var reddit = req.body.reddit;
    var slack = req.body.slack;
    var facebook = req.body.facebook;
    var twitter = req.body.twitter;
    var bitcointalk = req.body.bitcointalk;
    var github = req.body.github;
    var telegram = req.body.telegram;
    var whitepaper = req.body.whitepaper;
    var priceData = req.body.priceData;
    var comments = req.body.comments;

    const token = await Token.findOne({ address: tokenAddress });
    if(token)
    {
      var appendTokenInfo = {
        _id: tempID,
        email: email,
        name: name,
        tokenAddress: tokenAddress,
        officialUrl: officialUrl,
        logoIcon: logoIcon,
        description: description,
        officialEmailAdd: officialEmailAdd,
        blog: blog,
        reddit: reddit,
        slack: slack,
        facebook: facebook,
        twitter: twitter,
        bitcointalk: bitcointalk,
        github: github,
        telegram: telegram,
        whitepaper: whitepaper,
        priceData: priceData,
        comments: comments,
        checked: "false",
      }

      var tokenInfo = token.tokenInformation;
      tokenInfo.push(appendTokenInfo);

      await Token.updateOne(
        { address: { $regex: new RegExp(`^${tokenAddress}$`, 'i') } },
        { tokenInformation: tokenInfo },
        {
          upsert: true,
          setDefaultsOnInsert: true,
        },
        async function (err) {
          if (err) {
            return res.status(200).json({
              success: false,
              error: err.message,
            });
          }

          return res.status(200).json({ success: true, error: ""});
        }
      );
    } else {
      return res.status(200).json({ success: false, error: "There is no matching token data" });
    }
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message });
  }
};

exports.getTokenInfo = async (req, res) => {
  try {
    var page = parseInt(req.params.page);
    var rowsPerPage = parseInt(req.params.rowsPerPage);
    var address = req.params.address;
    const skipIndex = page * rowsPerPage;

    var tokenInfo = await Token.findOne(
      { address: { $regex: new RegExp(`^${address}$`, 'i') } },
      { _id: 0, tokenInformation: 1 }
    ).lean();
    // .skip(skipIndex)
    // .limit(rowsPerPage);

    if (tokenInfo.tokenInformation === undefined)
      return res
        .status(200)
        .json({ success: false, error: "There is no Token Information data" });

    var tokenInfoList = tokenInfo.tokenInformation;
    var totalCount = tokenInfoList.length;
    if(!totalCount)
      totalCount = 0

    tokenInfoList = tokenInfoList.slice( skipIndex, skipIndex + rowsPerPage )
    return res.status(200).json({
      success: true,
      data: { tokenInfo: tokenInfoList, totalCount: totalCount },
      error: "",
    });
  } catch (err) {
    return res
      .status(200)
      .json({ success: false, error: err.message });
  }
};

exports.getAllToken = async (req, res) => {
  try {
    var page = parseInt(req.params.page);
    var rowsPerPage = parseInt(req.params.rowsPerPage);
    const skipIndex = page * rowsPerPage;

    var token = await Token.find(
      {},
      {
        _id: 0,
        address: 1,
        name: 1,
        symbol: 1,
        type: 1,
        isShown: 1,
      },
    ).lean()
    .skip(skipIndex)
    .limit(rowsPerPage);

    var totalCount = await Token.countDocuments();
    if(!totalCount)
      totalCount = 0;

    if (!token)
      return res
        .status(200)
        .json({ success: false, error: "There is no Token data" });

    return res.status(200).json({
      success: true,
      data: { token: token, totalCount: totalCount },
      error: "",
    });
  } catch (err) {
    return res
      .status(200)
      .json({ success: false, error: err.message, data: null });
  }
};

exports.updateTokenInfo = async (req, res) => {
  try {
    var tokenInfoID = req.body.tokenInfoID;
    var tokenAddress = req.body.tokenAddress;

    await Token.updateMany(
      {
        address: { $regex: new RegExp(`^${tokenAddress}$`, 'i') },
        "tokenInformation.checked": "true"
      },
      {
        $set: {
          "tokenInformation.$[].checked": "false"
        }
      }
    )
    var updateTokenID = await Token.updateOne(
      {
        address: { $regex: new RegExp(`^${tokenAddress}$`, 'i') },
        "tokenInformation._id": tokenInfoID
      },
      {
        $set: {
          "tokenInformation.$.checked": "true"
        }
      }
    )

    if(updateTokenID)
      return res.status(200).json({ success: true, error: ""});
    else
      return res.status(200).json({ success: false, error: "There is no matching token information data" });
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message });
  }
};

exports.updateTokenState = async (req, res) => {
  try {
    var tokenAddress = req.body.tokenAddress;

    var updateTokenState = await Token.updateOne(
      {
        address: { $regex: new RegExp(`^${tokenAddress}$`, 'i') },
      },
      {
        $set: {
          "isShown": "true"
        }
      }
    )

    if(updateTokenState)
      return res.status(200).json({ success: true, error: ""});
    else
      return res.status(200).json({ success: false, error: "There is no matching token data" });
  } catch (err) {
    return res.status(200).json({ success: false, error: err.message });
  }
};
