const dashboardRepository = require("../repositories/dashboard.repository");

class DashboardService {

    async getStats() {

        const totalArticles =
            await dashboardRepository.getTotalArticles();

        const totalAttachments =
            await dashboardRepository.getTotalAttachments();

        const totalUsers =
            await dashboardRepository.getTotalUsers();

        const pendingUsers =
            await dashboardRepository.getPendingUsers();

        const pendingArticles =
            await dashboardRepository.getPendingArticles();

        const totalSections =
            await dashboardRepository.getTotalSections();

        const totalTags =
            await dashboardRepository.getTotalTags();

        return {
            totalUsers,
            pendingUsers,
            totalArticles,
            pendingArticles,
            totalAttachments,
            totalSections,
            totalTags
        };

    }

}

module.exports = new DashboardService();