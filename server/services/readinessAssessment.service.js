const readinessAssessmentRepository =
require("../repositories/readinessAssessment.repository");

class ReadinessAssessmentService {

    async createAssessment(data) {

        return await readinessAssessmentRepository.createAssessment(data);

    }

    async getAllAssessments() {

        return await readinessAssessmentRepository.getAllAssessments();

    }

    async getAssessmentByMember(memberId) {

        return await readinessAssessmentRepository.getAssessmentByMember(memberId);

    }

    async updateAssessment(assessmentId, data) {

        return await readinessAssessmentRepository.updateAssessment(

            assessmentId,

            data

        );

    }

}

module.exports = new ReadinessAssessmentService();