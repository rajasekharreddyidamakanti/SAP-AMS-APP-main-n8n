const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");

const {
    sectionValidator
} = require("../validators");

const {
    createSection,
    getSectionsByArticle,
    getSectionById,
    updateSection,
    deleteSection
} = require("../controllers/section.controller");

router.post(
    "/",
    authMiddleware,
    sectionValidator,
    validate,
    createSection
);

router.get(
    "/article/:articleId",
    authMiddleware,
    getSectionsByArticle
);

router.get(
    "/:id",
    authMiddleware,
    getSectionById
);

router.put(
    "/:id",
    authMiddleware,
    sectionValidator,
    validate,
    updateSection
);

router.delete(
    "/:id",
    authMiddleware,
    deleteSection
);

module.exports = router;