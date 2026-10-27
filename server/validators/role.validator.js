const { body } = require("express-validator");

const roleValidator = [

    body("role_id")
        .notEmpty()
        .withMessage("role_id is required")
        .isInt({ min: 1 })
        .withMessage("role_id must be a positive integer"),

];

module.exports = {
    roleValidator
};