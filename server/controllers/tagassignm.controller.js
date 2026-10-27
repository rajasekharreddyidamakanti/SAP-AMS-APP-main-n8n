const tagAssignmentService = require("../services/tagAssignment.service");

/* ---------------- ARTICLE ---------------- */

const assignArticleTag = async (req, res) => {

    try {

        await tagAssignmentService.assignArticleTag(req.body);

        res.json({
            message: "Tag assigned to article"
        });

    } catch (error) {

        res.status(error.status || 500).json({
            message: error.message
        });

    }

};

const getArticleTags = async (req, res) => {

    try {

        const result =
            await tagAssignmentService.getArticleTags(req.params.id);

        res.json(result);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

/* ---------------- SECTION ---------------- */

const assignSectionTag = async (req, res) => {

    try {

        await tagAssignmentService.assignSectionTag(req.body);

        res.json({
            message: "Tag assigned to section"
        });

    } catch (error) {

        res.status(error.status || 500).json({
            message: error.message
        });

    }

};

const getSectionTags = async (req, res) => {

    try {

        const result =
            await tagAssignmentService.getSectionTags(req.params.id);

        res.json(result);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

/* ---------------- ATTACHMENT ---------------- */

const assignAttachmentTag = async (req, res) => {

    try {

        await tagAssignmentService.assignAttachmentTag(req.body);

        res.json({
            message: "Tag assigned to attachment"
        });

    } catch (error) {

        res.status(error.status || 500).json({
            message: error.message
        });

    }

};

const getAttachmentTags = async (req, res) => {

    try {

        const result =
            await tagAssignmentService.getAttachmentTags(req.params.id);

        res.json(result);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

module.exports = {
    assignArticleTag,
    getArticleTags,
    assignSectionTag,
    getSectionTags,
    assignAttachmentTag,
    getAttachmentTags
};