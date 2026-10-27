const attachmentRepository = require("../repositories/attachment.repository");

class AttachmentService {

    async uploadFile(req) {

        if (!req.file) {
            throw {
                status: 400,
                message: "No file uploaded"
            };
        }

        const article = await attachmentRepository.getArticle(
            req.params.id
        );

        if (!article) {
            throw {
                status: 404,
                message: "Article not found"
            };
        }

        let tags = [];

        if (req.body.tags) {
            try {
                tags = JSON.parse(req.body.tags);

                if (!Array.isArray(tags)) {
                    tags = [];
                }

            } catch {
                tags = [];
            }
        }

        return await attachmentRepository.uploadAttachment({

            articleId: req.params.id,

            fileName: req.file.originalname,

            filePath: req.file.path,

            fileType: req.file.mimetype,

            uploadedBy: req.user.userId,

            tags

        });

    }

    async deleteAttachment(id) {

        const attachment =
            await attachmentRepository.getAttachment(id);

        if (!attachment) {

            throw {
                status:404,
                message:"Attachment not found"
            };

        }

        return await attachmentRepository.deleteAttachment(id);

    }

    async getAttachments(articleId){

        return await attachmentRepository.getAttachmentsByArticle(
            articleId
        );

    }

}

module.exports = new AttachmentService();