const tagAssignmentRepository = require("../repositories/tagAssignment.repository");

class TagAssignmentService {

    async assignArticleTag(data) {

        await tagAssignmentRepository.assignArticleTag(
            data.article_id,
            data.tag_id
        );

    }

    async getArticleTags(id) {

        return await tagAssignmentRepository.getArticleTags(id);

    }

    async assignSectionTag(data) {

        await tagAssignmentRepository.assignSectionTag(
            data.section_id,
            data.tag_id
        );

    }

    async getSectionTags(id) {

        return await tagAssignmentRepository.getSectionTags(id);

    }

    async assignAttachmentTag(data) {

        await tagAssignmentRepository.assignAttachmentTag(
            data.attachment_id,
            data.tag_id
        );

    }

    async getAttachmentTags(id) {

        return await tagAssignmentRepository.getAttachmentTags(id);

    }

}

module.exports = new TagAssignmentService();