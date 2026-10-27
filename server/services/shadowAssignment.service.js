const shadowAssignmentRepository =
require("../repositories/shadowAssignment.repository");

class ShadowAssignmentService {

    async createShadow(data) {

        return await shadowAssignmentRepository.createShadow(data);

    }

    async getAllShadows() {

        return await shadowAssignmentRepository.getAllShadows();

    }

    async getShadowByMember(memberId) {

        return await shadowAssignmentRepository.getShadowByMember(memberId);

    }

    async updateShadow(shadowId, data) {

        return await shadowAssignmentRepository.updateShadow(

            shadowId,

            data

        );

    }

}

module.exports = new ShadowAssignmentService();