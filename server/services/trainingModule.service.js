const trainingModuleRepository =
require("../repositories/trainingModule.repository");

class TrainingModuleService {

    async createModule(data) {

        return await trainingModuleRepository.createModule(data);

    }

    async getAllModules() {

        return await trainingModuleRepository.getAllModules();

    }

    async getModuleById(moduleId) {

        return await trainingModuleRepository.getModuleById(moduleId);

    }

    async updateModule(moduleId, data) {

        return await trainingModuleRepository.updateModule(

            moduleId,

            data

        );

    }

    async deleteModule(moduleId) {

        await trainingModuleRepository.deleteModule(moduleId);

    }

}

module.exports = new TrainingModuleService();