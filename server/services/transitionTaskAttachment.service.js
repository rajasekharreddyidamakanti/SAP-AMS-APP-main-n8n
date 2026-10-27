const repository = require("../repositories/transitionTaskAttachment.repository");
const path = require("path");

class TransitionTaskAttachmentService {
    async uploadFile(req) {
        if (!req.file) throw { status: 400, message: "No file uploaded" };
        const task = await repository.getTask(req.params.taskId);
        if (!task) throw { status: 404, message: "Task not found" };

        return repository.create({
            taskId: req.params.taskId,
            fileName: req.file.originalname,
            filePath: `/uploads/${path.basename(req.file.path)}`,
            fileType: req.file.mimetype,
            uploadedBy: req.user.userId,
        });
    }

    async list(taskId) {
        const task = await repository.getTask(taskId);
        if (!task) throw { status: 404, message: "Task not found" };
        return repository.list(taskId);
    }

    async delete(attachmentId) {
        const attachment = await repository.getById(attachmentId);
        if (!attachment) throw { status: 404, message: "Attachment not found" };
        return repository.delete(attachmentId);
    }
}

module.exports = new TransitionTaskAttachmentService();
