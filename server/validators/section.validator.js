const { body } = require("express-validator");

const sectionValidator = [

    body("title")
        .trim()
        .notEmpty()
        .withMessage("Section title is required"),

    body("article_id")
    .isInt({ min: 1 }),

    body("content")
    .optional()
    .notEmpty()

];

module.exports = {
    sectionValidator
};