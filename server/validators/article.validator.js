const { body } = require("express-validator");

const createArticleValidator = [

    body("title").notEmpty(),

    body("summary").optional(),

    body("content").optional(),

    body("module").optional().default("General"),

    body("severity").optional(),

    body("department").optional(),

    body("status")
        .optional()
        .default("under_review"),

    body("visibility")
        .optional({ nullable: true })
        .trim()
        .customSanitizer(v => (v || "public").toLowerCase())
        .isIn(["public","private","restricted"])
        .withMessage("Invalid visibility"),

    body("roles").optional().isArray(),

    body("tags").optional().isArray(),

    body("co_author_id").optional({ nullable: true }).isInt()
];

const updateArticleValidator = [

    body("title").optional().trim(),

    body("summary").optional(),

    body("content").optional(),

    body("module").optional(),

    body("severity").optional(),

    body("visibility")
    .optional({ nullable: true })
    .trim()
    .customSanitizer(value => (value || "public").toLowerCase())
    .isIn([
        "public",
        "private",
        "restricted"
    ])
    .withMessage("Invalid visibility"),

    body("department").optional(),

    body("roles").optional().isArray(),

    body("tags").optional().isArray()

];

module.exports = {
    createArticleValidator,
    updateArticleValidator
};