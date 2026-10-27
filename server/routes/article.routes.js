const express = require("express");
const router = express.Router();

const articleController = require("../controllers/article.controller");
const authMiddleware = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");


const {
    createArticleValidator,
    updateArticleValidator
} = require("../validators");
// Create
router.post(
    "/",
    authMiddleware,
    createArticleValidator,
    validate,
    articleController.createArticle
);

// Read
router.get(
    "/",
    authMiddleware,
    articleController.getAllArticles
);

router.get(
    "/pending",
    authMiddleware,
    articleController.getPendingArticles
);

router.get(
    "/search",
    articleController.searchArticles
);

router.get(
    "/:id",
    articleController.getArticleById
);

router.get(
    "/:id/experts",
    authMiddleware,
    articleController.getArticleExperts
);

// Update
router.put(
    "/:id",
    authMiddleware,
    updateArticleValidator,
    validate,
    articleController.updateArticle
);

// Approval
router.put(
    "/approve/:id",
    authMiddleware,
    articleController.approveArticle
);

router.put(
    "/co-author-approve/:id",
    authMiddleware,
    articleController.coAuthorApproveArticle
);

router.put(
    "/reject/:id",
    authMiddleware,
    articleController.rejectArticle
);

// Delete
router.delete(
    "/:id",
    authMiddleware,
    articleController.deleteArticle
);

router.get(
    "/:id/history",
    authMiddleware,
    articleController.getEditHistory
);

module.exports = router;