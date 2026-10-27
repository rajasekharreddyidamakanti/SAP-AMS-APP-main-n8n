const db = require("../config/db");

class OnboardingDashboardRepository {

    async getDashboard() {

        const query = `
        SELECT

            (SELECT COUNT(*)
             FROM onboarding_members) AS total_members,

            (SELECT COUNT(*)
             FROM training_assignments
             WHERE status = 'completed') AS training_completed,

            (SELECT COUNT(*)
             FROM access_requests
             WHERE status = 'pending') AS access_pending,

            (SELECT COUNT(*)
             FROM shadow_assignments
             WHERE status = 'in_progress') AS shadow_in_progress,

            (SELECT COUNT(*)
             FROM readiness_assessments
             WHERE recommendation = 'ready') AS ready_for_project,

            (SELECT COUNT(*)
             FROM certifications
             WHERE status = 'completed') AS certified_members;
        `;

        const { rows } = await db.query(query);

        return rows[0];
    }

}

module.exports = new OnboardingDashboardRepository();