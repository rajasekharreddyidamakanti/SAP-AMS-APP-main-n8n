const service = require("../services/transitionTaskAttachment.service");

const uploadFile = async (req, res) => {
    try {
        res.status(201).json({ success: true, data: await service.uploadFile(req) });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

const list = async (req, res) => {
    try {
        res.json({ success: true, data: await service.list(req.params.taskId) });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

const deleteAttachment = async (req, res) => {
    try {
        await service.delete(req.params.attachmentId);
        res.json({ success: true, message: "Attachment deleted successfully" });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

module.exports = { uploadFile, list, deleteAttachment };
