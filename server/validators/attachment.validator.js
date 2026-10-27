const { param } = require("express-validator");

const attachmentValidator = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Valid Article ID is required")
];

module.exports = {
    attachmentValidator
};