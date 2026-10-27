const onboardingDashboardRepository =
require("../repositories/onboardingDashboard.repository");

class OnboardingDashboardService {

    async getDashboard() {

        return await onboardingDashboardRepository.getDashboard();

    }

}

module.exports = new OnboardingDashboardService();