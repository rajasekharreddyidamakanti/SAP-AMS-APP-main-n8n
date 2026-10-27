const tagService = require("../services/tag.service");

// ── Existing user-facing endpoints ──────────────────────────────────────────

const requestTag = async (req, res) => {
    try {
        const result = await tagService.requestTag(req.user.userId, req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

const getPendingTags = async (req, res) => {
    try {
        const result = await tagService.getPendingTags();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const approveTag = async (req, res) => {
    try {
        await tagService.approveTag(req.params.id);
        res.json({ message: "Tag approved" });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

const rejectTag = async (req, res) => {
    try {
        await tagService.rejectTag(req.params.id);
        res.json({ message: "Tag rejected" });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

// ── Admin tag management ─────────────────────────────────────────────────────

const getAllTags = async (req, res) => {
    try {
        const result = await tagService.getAllTags();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createTag = async (req, res) => {
    try {
        const result = await tagService.createTag(req.body.tag_name);
        res.status(201).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

const updateTag = async (req, res) => {
    try {
        const result = await tagService.updateTag(req.params.id, req.body.tag_name);
        res.json(result);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

const deleteTag = async (req, res) => {
    try {
        await tagService.deleteTag(req.params.id);
        res.json({ message: "Tag deleted" });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

const getPendingTagsWithDetails = async (req, res) => {
    try {
        const result = await tagService.getPendingTagsWithDetails();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUsersWithTags = async (req, res) => {
    try {
        const result = await tagService.getUsersWithTags();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const assignTagToUser = async (req, res) => {
    try {
        await tagService.assignTagToUser(req.params.userId, req.body.tag_id);
        res.json({ message: "Tag assigned" });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

const removeTagFromUser = async (req, res) => {
    try {
        await tagService.removeTagFromUser(req.params.userId, req.params.tagId);
        res.json({ message: "Tag removed" });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

module.exports = {
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
};