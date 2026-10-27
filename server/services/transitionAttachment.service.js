const transitionAttachmentRepository = require("../repositories/transitionAttachment.repository");

class TransitionAttachmentService {

    async uploadFile(req) {
        if (!req.file) {
            throw { status: 400, message: "No file uploaded" };
        }

        const transition = await transitionAttachmentRepository.getTransition(req.params.id);
        if (!transition) {
            throw { status: 404, message: "Transition not found" };
        }

        return await transitionAttachmentRepository.uploadAttachment({
            transitionId: req.params.id,
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileType: req.file.mimetype,
            uploadedBy: req.user.userId,
        });
    }

    async getAttachments(transitionId) {
        return await transitionAttachmentRepository.getAttachmentsByTransition(transitionId);
    }

    async deleteAttachment(id) {
        const attachment = await transitionAttachmentRepository.getAttachment(id);
        if (!attachment) {
            throw { status: 404, message: "Attachment not found" };
        }
        return await transitionAttachmentRepository.deleteAttachment(id);
    }
}

module.exports = new TransitionAttachmentService();