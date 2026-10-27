const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/auth.middleware");

const {

    assignArticleTag,
    getArticleTags,

    assignSectionTag,
    getSectionTags,

    assignAttachmentTag,
    getAttachmentTags

} = require("../controllers/tagassignm.controller");

/* ------------ Article ------------ */

router.post(
    "/article",
    authMiddleware,
    assignArticleTag
);

router.get(
    "/article/:id",
    authMiddleware,
    getArticleTags
);

/* ------------ Section ------------ */

router.post(
    "/section",
    authMiddleware,
    assignSectionTag
);

router.get(
    "/section/:id",
    authMiddleware,
    getSectionTags
);

/* ------------ Attachment ------------ */

router.post(
    "/attachment",
    authMiddleware,
    assignAttachmentTag
);

router.get(
    "/attachment/:id",
    authMiddleware,
    getAttachmentTags
);

module.exports = router;