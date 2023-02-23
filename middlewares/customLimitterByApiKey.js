const moment = require("moment");
const redis = require("redis");
const User = require("../models/UserModel");

const { constants } = require("../config/constants");
const redisServer = require("../config/redis.json");
const redis_client = redis.createClient(redisServer.port, redisServer.host);
const WINDOW_DURATION_IN_HOURS = 1;
const MAX_WINDOW_REQUEST_COUNT = 1000;
const WINDOW_LOG_DURATION_IN_HOURS = 0.1;

module.exports = async function (req, res, next) {
  const apikey = req.query.apikey;

  try {
    //Checks if the Redis client is present
    if (!redis_client) {
      console.log("Redis client does not exist!");
      process.exit(1);
    }

    const user = await User.findOne({ "apiKeys.apiKey": apikey });

    var apiKey,
      limit = constants.API_KEY_LIMIT_PER_HOUR.FREE;

    for (let i = 0; i < user.apiKeys.length; i++) {
      if (user.apiKeys[i].apiKey === apikey) {
        apiKey = apikey;
        limit = user.apiKeys[i].hrLimit;
      }
    }

    //Gets the records of the current user base on the IP address, returns a null if the is no user found
    redis_client.get(apiKey, function (error, record) {
      if (error) throw error;
      const currentTime = moment();
      //When there is no user record then a new record is created for the user and stored in the Redis storage
      if (record == null) {
        let newRecord = [];
        let requestLog = {
          requestTimeStamp: currentTime.unix(),
          requestCount: 1,
        };
        newRecord.push(requestLog);
        redis_client.set(apiKey, JSON.stringify(newRecord));
        return next();
      }
      //When the record is found then its value is parsed and the number of requests the user has made within the last window is calculated
      let data = JSON.parse(record);
      let windowBeginTimestamp = moment()
        .subtract(WINDOW_DURATION_IN_HOURS, "hours")
        .unix();
      let requestsinWindow = data.filter((entry) => {
        return entry.requestTimeStamp > windowBeginTimestamp;
      });
      console.log("requestsinWindow", requestsinWindow);
      let totalWindowRequestsCount = requestsinWindow.reduce(
        (accumulator, entry) => {
          return accumulator + entry.requestCount;
        },
        0
      );
      //if maximum number of requests is exceeded then an error is returned
      if (totalWindowRequestsCount >= limit) {
        res.status(429).json({
          error: `You have exceeded the ${limit} requests in ${WINDOW_DURATION_IN_HOURS} hrs limit!`,
        });
      } else {
        //When the number of requests made are less than the maximum the a new entry is logged
        let lastRequestLog = data[data.length - 1];
        let potentialCurrentWindowIntervalStartTimeStamp = currentTime
          .subtract(WINDOW_LOG_DURATION_IN_HOURS, "hours")
          .unix();
        //When the interval has not passed from the last request, then the counter increments
        if (
          lastRequestLog.requestTimeStamp >
          potentialCurrentWindowIntervalStartTimeStamp
        ) {
          lastRequestLog.requestCount++;
          data[data.length - 1] = lastRequestLog;
        } else {
          //When the interval has passed, a new entry for current user and timestamp is logged
          data.push({
            requestTimeStamp: currentTime.unix(),
            requestCount: 1,
          });
        }
        redis_client.set(apiKey, JSON.stringify(data));
        next();
      }
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
