const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const validate = require("../middleware/validate.middleware");

const {
    attachmentValidator
} = require("../validators");

const {
    uploadFile,
    getAttachments,
    deleteAttachment
} = require("../controllers/attachment.controller");

// Upload attachment
router.post(
    "/:id/upload",
    authMiddleware,
    attachmentValidator,
    validate,
    upload.single("file"),
    uploadFile
);

// Get all attachments
router.get(
    "/article/:articleId",
    authMiddleware,
    getAttachments
);

// Delete attachment
router.delete(
    "/:attachmentId",
    authMiddleware,
    deleteAttachment
);

module.exports = router;