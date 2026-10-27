const tagRepository = require("../repositories/tag.repository");

class TagService {

    async requestTag(userId, data) {

        return await tagRepository.requestTag(
            userId,
            data.tag_name,
            data.deadline
        );
    }

    async getPendingTags() {

        return await tagRepository.getPendingTags();

    }

    async approveTag(id) {

        const request =
            await tagRepository.getTagRequest(id);

        if (!request) {

            throw {
                status: 404,
                message: "Tag request not found"
            };

        }

        const tag =
            await tagRepository.createExpertiseTag(
                request.tag_name
            );

        await tagRepository.approveExpertiseTag(tag.tag_id);

        await tagRepository.assignTag(
            request.user_id,
            tag.tag_id
        );

        await tagRepository.approveTag(id);

    }

    async rejectTag(id) {

        const request =
            await tagRepository.getTagRequest(id);

        if (!request) {

            throw {
                status: 404,
                message: "Tag request not found"
            };

        }

        await tagRepository.rejectTag(id);

    }

    async getAllTags() {
        return await tagRepository.getAllTags();
    }

    async createTag(tagName) {
        return await tagRepository.createExpertiseTag(tagName);
    }

    async updateTag(tagId, tagName) {
        const updated = await tagRepository.updateTag(tagId, tagName);
        if (!updated) throw { status: 404, message: "Tag not found" };
        return updated;
    }

    async deleteTag(tagId) {
        await tagRepository.deleteTag(tagId);
    }

    async getPendingTagsWithDetails() {
        return await tagRepository.getPendingTagsWithDetails();
    }

    async getUsersWithTags() {
        return await tagRepository.getUsersWithTags();
    }

    async assignTagToUser(userId, tagId) {
        await tagRepository.assignTag(userId, tagId);
    }

    async removeTagFromUser(userId, tagId) {
        await tagRepository.removeTagFromUser(userId, tagId);
    }

}

module.exports = new TagService();