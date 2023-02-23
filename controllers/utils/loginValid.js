const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateLoginInput(data) {
    let error = null;
    // Convert empty fields to an empty string so we can use validator functions
    data.name = !isEmpty(data.name) ? data.name : "";
    data.password = !isEmpty(data.password) ? data.password : "";
    // name checks
    if (Validator.isEmpty(data.name)) {
        error = "Name field is required";
    }
    // Password checks
    if (Validator.isEmpty(data.password)) {
        error = "Password field is required";
    }
    return {
        error,
        isValid: error == null
    };
};
