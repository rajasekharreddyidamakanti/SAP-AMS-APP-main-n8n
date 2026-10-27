const transitionAttachmentService = require("../services/transitionAttachment.service");

const uploadFile = async (req, res) => {
    try {
        const attachment = await transitionAttachmentService.uploadFile(req);
        res.status(201).json({ message: "File uploaded successfully", attachment });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

const getAttachments = async (req, res) => {
    try {
        const attachments = await transitionAttachmentService.getAttachments(req.params.transitionId);
        res.json(attachments);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

const deleteAttachment = async (req, res) => {
    try {
        await transitionAttachmentService.deleteAttachment(req.params.attachmentId);
        res.json({ message: "Attachment deleted successfully" });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

module.exports = { uploadFile, getAttachments, deleteAttachment };