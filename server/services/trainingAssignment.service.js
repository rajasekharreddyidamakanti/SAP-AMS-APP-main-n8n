const trainingAssignmentRepository =
require("../repositories/trainingAssignment.repository");

class TrainingAssignmentService {

    async assignModule(data) {

        return await trainingAssignmentRepository.assignModule(data);

    }

    async getAssignments(memberId) {

        return await trainingAssignmentRepository.getAssignments(memberId);

    }

    async updateAssignment(assignmentId, data) {

        return await trainingAssignmentRepository.updateAssignment(

            assignmentId,

            data

        );

    }

}

module.exports = new TrainingAssignmentService();