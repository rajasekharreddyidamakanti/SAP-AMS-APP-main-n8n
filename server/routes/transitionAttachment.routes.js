const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const { uploadFile, getAttachments, deleteAttachment } = require("../controllers/transitionAttachment.controller");

router.post("/:id/upload", authMiddleware, upload.single("file"), uploadFile);
router.get("/transition/:transitionId", authMiddleware, getAttachments);
router.delete("/:attachmentId", authMiddleware, deleteAttachment);

module.exports = router;