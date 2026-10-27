const { body } = require("express-validator");

const tagValidator = [

    body("tag_name")
        .trim()
        .notEmpty()
        .withMessage("Tag name is required")
        .isLength({ max: 50 })
];

module.exports = {
    tagValidator
};