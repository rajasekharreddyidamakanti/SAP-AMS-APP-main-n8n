const { body } = require("express-validator");

const visibilityValidator = [

    body("visibility")
        .trim()
        .notEmpty()
        .withMessage("Visibility is required")
        .isIn(["public", "private", "restricted"])
        .withMessage("Visibility must be public, private or restricted"),

    body("roles")
        .optional()
        .isArray()
        .withMessage("Roles must be an array"),

    body("roles.*")
        .optional()
        .isInt()
        .withMessage("Each role id must be an integer")

];

module.exports = {
    visibilityValidator
};