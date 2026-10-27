const sectionRepository = require("../repositories/section.repository");

class SectionService {

    async createSection(data) {
        return await sectionRepository.createSection(data);
    }

    async getSectionsByArticle(articleId) {
        return await sectionRepository.getSectionsByArticle(articleId);
    }

    async getSectionById(id) {
        return await sectionRepository.getSectionById(id);
    }

    async updateSection(id, data) {
        return await sectionRepository.updateSection(id, data);
    }

    async deleteSection(id) {
        return await sectionRepository.deleteSection(id);
    }

}

module.exports = new SectionService();