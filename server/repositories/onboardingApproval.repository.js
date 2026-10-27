const db = require("../config/db");

class OnboardingApprovalRepository {

    async approveMember(memberId) {

        const query = `
        WITH checks AS (

            SELECT

                NOT EXISTS (
                    SELECT 1
                    FROM training_assignments
                    WHERE member_id = $1
                    AND status <> 'completed'
                ) AS training_completed,

                NOT EXISTS (
                    SELECT 1
                    FROM access_requests
                    WHERE member_id = $1
                    AND status <> 'provisioned'
                ) AS access_completed,

                EXISTS (
                    SELECT 1
                    FROM shadow_assignments
                    WHERE member_id = $1
                    AND status = 'completed'
                ) AS shadow_completed,

                EXISTS (
                    SELECT 1
                    FROM readiness_assessments
                    WHERE member_id = $1
                    AND recommendation = 'ready'
                ) AS assessment_ready,

                EXISTS (
                    SELECT 1
                    FROM certifications
                    WHERE member_id = $1
                    AND status = 'completed'
                ) AS certification_completed

        )

        UPDATE onboarding_members
        SET overall_status = 'certified'
        FROM checks

        WHERE onboarding_members.member_id = $1

        AND checks.training_completed
        AND checks.access_completed
        AND checks.shadow_completed
        AND checks.assessment_ready
        AND checks.certification_completed

        RETURNING onboarding_members.*;
        `;

        const { rows } = await db.query(query, [memberId]);

        return rows[0];
    }

}

module.exports = new OnboardingApprovalRepository();