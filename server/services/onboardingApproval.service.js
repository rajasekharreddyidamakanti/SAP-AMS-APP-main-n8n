const onboardingApprovalRepository =
require("../repositories/onboardingApproval.repository");

class OnboardingApprovalService {

    async approveMember(memberId) {

        return await onboardingApprovalRepository.approveMember(memberId);

    }

}

module.exports = new OnboardingApprovalService();