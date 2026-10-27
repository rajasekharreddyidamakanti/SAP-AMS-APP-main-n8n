const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { tagValidator } = require("../validators");

const {
    requestTag,
    getPendingTags,
    approveTag,
    rejectTag,
    getAllTags,
    createTag,
    updateTag,
    deleteTag,
    getPendingTagsWithDetails,
    getUsersWithTags,
    assignTagToUser,
    removeTagFromUser,
} = require("../controllers/tag.controller");

// ── User-facing ────────────────────────────────────────────────────────────
router.post("/request", authMiddleware, tagValidator, validate, requestTag);
router.get("/pending", authMiddleware, getPendingTags);
router.put("/approve/:id", authMiddleware, approveTag);
router.put("/reject/:id", authMiddleware, rejectTag);

// ── Admin: CRUD on expertise_tags ─────────────────────────────────────────
router.get("/admin/all", authMiddleware, getAllTags);
router.post("/admin/create", authMiddleware, createTag);
router.put("/admin/:id", authMiddleware, updateTag);
router.delete("/admin/:id", authMiddleware, deleteTag);

// ── Admin: pending tag requests with full details ─────────────────────────
router.get("/admin/pending", authMiddleware, getPendingTagsWithDetails);

// ── Admin: users with tags ────────────────────────────────────────────────
router.get("/admin/users", authMiddleware, getUsersWithTags);
router.post("/admin/users/:userId/assign", authMiddleware, assignTagToUser);
router.delete("/admin/users/:userId/tags/:tagId", authMiddleware, removeTagFromUser);

module.exports = router;