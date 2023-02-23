const nodemailer = require("nodemailer");

const Log = require("../models/LogModel");
const Email = require("../models/EmailModel");
const EmailTypes = require("../models/EmailTypesModel");

var transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: process.env.EMAIL_SMTP_PORT,
  secure: process.env.EMAIL_SMTP_SECURE,
  auth: {
    user: process.env.EMAIL_SMTP_USERNAME,
    pass: process.env.EMAIL_SMTP_PASSWORD,
  },
});

exports.DailyReport = () => {
  let curDate = new Date(Date.now());
  let hour = curDate.getHours();
  let minute = curDate.getMinutes();
  let second = curDate.getSeconds();

  let curTime = (second + minute * 60 + hour * 3600) * 1000;
  let finalTime = (59 + 59 * 60 + 23 * 3600) * 1000;
  let subTime = finalTime - curTime;

  const timer = setTimeout(() => {
    fistTimeout();
  }, subTime);
  return () => clearTimeout(timer);
};

function fistTimeout() {
  getTotalUser();

  let fullTime = (59 + 59 * 60 + 23 * 3600) * 1000;
  setInterval(getTotalUser, fullTime);
}

async function getTotalUser() {
  let curDate = new Date(Date.now());
  let day = curDate.getDate();
  let month = curDate.getMonth() + 1;
  let year = curDate.getFullYear();
  let startDate = Date.UTC(year, month - 1, day - 2, 0, 0, 0);
  let endDate = Date.UTC(year, month - 1, day - 2, 23, 59, 59);

  var aggregate = await Log.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(startDate), $lt: new Date(endDate) },
      },
    },
    {
      $group: { _id: "$ip" },
    },
  ]);
  console.log("count: " + aggregate.length);

  let emails = await EmailTypes.findOne({ type: 1 });
  let emailContent = aggregate.length + " user";

  if (emails) {
    let insertEmail = {
      emailType: 1,
      emailAddress: emails.emails,
      emailContent: emailContent,
      sendDate: new Date(endDate),
    };

    let insertResult = await Email.insertMany(insertEmail);
    if (insertResult) console.log("Email Insert Success");
    else console.log("Email Insert Failed");
  }

  for (let i = 0; i < emails.emails.length; i++) {
    let sendEmail = emails.emails[i];

    var mailOptions = {
      from: process.env.EMAIL_SMTP_USERNAME,
      to: sendEmail,
      subject: "Block Explorer Daily Visitors Statistics",
      text: `Block explorer' today visitors: ` + emailContent,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    console.log("Confirmation Email has been sent");
  }
}
