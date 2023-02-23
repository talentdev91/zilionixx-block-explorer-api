const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateProfileInput(data) {
  let error = "";
  // Email checks
  if (Validator.isEmpty(data.email)) {
    error = "Email field is required";
  } else if (!Validator.isEmail(data.email)) {
    error = "Email is invalid";
  }
  // if (!Validator.isLength(data.profileName, { min: 7, max: 35 }) && !Validator.isEmpty(data.profileName)) {
  //     error.profileName = "Password must be at least 6 characters";
  // }
  if (
    !Validator.isLength(data.password, { min: 6, max: 30 }) &&
    !Validator.isEmpty(data.password)
  ) {
    error = "Password must be at least 6 characters";
  }
  if (!Validator.equals(data.password, data.passwordConfirm)) {
    error = "Passwords must match";
  }
  console.log(error);
  return {
    error: error,
    isValid: isEmpty(error),
  };
};
