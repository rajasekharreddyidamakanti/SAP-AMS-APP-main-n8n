const onboardingRepository =
require("../repositories/onboarding.repository");

class OnboardingService {

    async createMember(data, createdBy) {

        data.created_by = createdBy;

        return await onboardingRepository.createMember(data);

    }

    async getAllMembers() {

        return await onboardingRepository.getAllMembers();

    }

    async getMemberById(memberId) {

        return await onboardingRepository.getMemberById(memberId);

    }

    async updateMember(memberId, data) {

        return await onboardingRepository.updateMember(
            memberId,
            data
        );

    }

}

module.exports = new OnboardingService();