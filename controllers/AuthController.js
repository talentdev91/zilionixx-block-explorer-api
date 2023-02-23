const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const validateRegisterInput = require("./utils/registerValid");
const validateLoginInput = require("./utils/loginValid");
const mongodb = require("../config/mongodb.json");
const keys = require("../config/keys");

exports.registerUser = async (req, res) => {
  const { error, isValid } = validateRegisterInput(req.body);
  // Check validation
  if (!isValid) {
    return res.status(200).json({ success: false, error: error });
  }
  User.findOne({ name: req.body.name }).then((user) => {
    if (user) {
      return res.status(200).json({ success: false, error: "Sorry! The username you entered is already in use." });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });
      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then((user) => res.json(user))
            .catch((err) => console.log(err));
          res.json({
            success: true,
          });
        });
      });
    }
  });
};

exports.loginUser = async (req, res) => {
  const { error, isValid } = validateLoginInput(req.body);
  // Check validation
  if (!isValid) {
    return res.status(200).json({ success: false, error: error });
  }
  const keyword = req.body.name;
  const password = req.body.password;
  // Find user by email
  User.findOne({ $or: [{ name: keyword }, { email: keyword }] }).then(
    (user) => {
      // Check if user exists
      if (!user) {
        return res.status(200).json({ success: false, error: "User not found" });
      }
      // Check password
      bcrypt.compare(password, user.password).then((isMatch) => {
        if (isMatch) {
          // User matched
          // Create JWT Payload
          const payload = {
            id: user.id,
            name: user.name,
          };
          // Sign token
          jwt.sign(
            payload,
            keys.secretOrKey,
            {
              expiresIn: 86400, // 1 day in seconds
            },
            async (err, token) => {
              if (!err) {
                user.loginTimes.push(new Date());
                user.isLoggedIn = true;
                await User.updateOne(
                  {
                    $or: [{ name: keyword }, { email: keyword }],
                  },
                  user,
                  { upsert: true, setDefaultsOnInsert: true },
                  function (err) {
                    if (err) {
                      return res.status(200).json({
                        success: false,
                        error:
                          "Sorry for failed user login information into database failed. Please try again",
                      });
                    }
                  }
                );

                return res.status(200).json({
                  success: true,
                  token: "Bearer " + token,
                });
              } else {
                return res.status(200).json({
                  success: false,
                  error: err.message,
                });
              }
            }
          );
        } else {
          return res
            .status(200)
            .json({ success: false, error: "Password incorrect" });
        }
      });
    }
  );
};

exports.confirmEmail = async (req, res) => {
  const { id } = req.query;

  User.findById(id)
    .then((user) => {
      // A user with that id does not exist in the DB. Perhaps some tricky
      // user tried to go to a different url than the one provided in the
      // confirmation email.
      if (!user) {
        res.json({ msg: msgs.couldNotFind });
      }

      // The user exists but has not been confirmed. We need to confirm this
      // user and let them know their email address has been confirmed.
      else if (user && !user.confirmed) {
        User.findByIdAndUpdate(id, { confirmed: true })
          .then(() => res.json({ msg: msgs.confirmed }))
          .catch((err) => console.log(err));
      }

      // The user has already confirmed this email address.
      else {
        res.json({ msg: msgs.alreadyConfirmed });
      }
    })
    .catch((err) => console.log(err));
};

exports.collectEmail = async (req, res) => {
  console.log("here is collect", req.query);
  const { id } = req.query;

  User.findById(id)
    .then((user) => {
      var transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: "kirylkrauchuk@gmail.com",
          pass: "Alezif61",
        },
      });

      var mailOptions = {
        from: "kirylkrauchuk@gmail.com",
        to: user.email,
        subject: "Sending Email using Node.js",
        text: `Hi,${user.fullName}

        Thank you for signing up with Zilionix.com
        
        To complete your account set-up  please verify your email address by clicking on the "confirmation" link below:
        
        Confirmation Link : https://localhost:3000/confirmemail?email=${user.email}&code=${user._id}
        
        *** If for any reason the above link is not clickable, please copy the link and paste in your choice of browser.
        
        Best regards,
        
        Zilionixx(Golden@star)
        `,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
      res.json({
        succeed: true,
        message: "Confirmation Email has been sent",
      });
    })
    .catch((err) => console.log(err));
};

exports.testLoginUser = async (req, res) => {
  return res.status(200).json({ success: true, data: req.body });
};
