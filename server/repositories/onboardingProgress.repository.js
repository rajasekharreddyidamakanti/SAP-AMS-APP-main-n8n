const db = require("../config/db");

class OnboardingProgressRepository {

    async updateOverallStatus(memberId) {

        const query = `
        UPDATE onboarding_members
        SET overall_status = (

            CASE

                WHEN EXISTS (

                    SELECT 1
                    FROM certifications
                    WHERE member_id = $1
                    AND status = 'completed'

                )

                AND EXISTS (

                    SELECT 1
                    FROM readiness_assessments
                    WHERE member_id = $1
                    AND recommendation = 'ready'

                )

                AND EXISTS (

                    SELECT 1
                    FROM shadow_assignments
                    WHERE member_id = $1
                    AND status = 'completed'

                )

                AND NOT EXISTS (

                    SELECT 1
                    FROM access_requests
                    WHERE member_id = $1
                    AND status <> 'provisioned'

                )

                AND NOT EXISTS (

                    SELECT 1
                    FROM training_assignments
                    WHERE member_id = $1
                    AND status <> 'completed'

                )

                THEN 'certified'

                ELSE 'in_progress'

            END

        )

        WHERE member_id = $1

        RETURNING *;
        `;

        const { rows } = await db.query(query, [memberId]);

        return rows[0];
    }

}

module.exports = new OnboardingProgressRepository();