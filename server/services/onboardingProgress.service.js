const onboardingProgressRepository =
require("../repositories/onboardingProgress.repository");

class OnboardingProgressService {

    async updateOverallStatus(memberId) {

        return await onboardingProgressRepository.updateOverallStatus(memberId);

    }

}

module.exports = new OnboardingProgressService();