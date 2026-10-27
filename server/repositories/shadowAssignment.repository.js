const db = require("../config/db");

class ShadowAssignmentRepository {

    async createShadow(data) {

        const query = `
        INSERT INTO shadow_assignments
        (
            member_id,
            mentor_id,
            start_date,
            end_date,
            status
        )
        VALUES
        ($1,$2,$3,$4,'pending')
        RETURNING *;
        `;

        const { rows } = await db.query(query,[

            data.member_id,
            data.mentor_id,
            data.start_date,
            data.end_date

        ]);

        return rows[0];
    }

    async getAllShadows() {

        const query = `
        SELECT
            sa.*,
            u.name AS mentor_name,
            om.user_id
        FROM shadow_assignments sa
        JOIN users u
            ON sa.mentor_id = u.user_id
        JOIN onboarding_members om
            ON sa.member_id = om.member_id
        ORDER BY shadow_id DESC;
        `;

        const { rows } = await db.query(query);

        return rows;
    }

    async getShadowByMember(memberId) {

        const query = `
        SELECT *
        FROM shadow_assignments
        WHERE member_id = $1;
        `;

        const { rows } = await db.query(query,[memberId]);

        return rows;
    }

    async updateShadow(shadowId, data) {

        let completedAt = null;

        if (data.status === "completed") {
            completedAt = new Date();
        }

        const query = `
        UPDATE shadow_assignments
        SET
            status = COALESCE($2, status),
            feedback = COALESCE($3, feedback),
            completed_at = COALESCE($4, completed_at)

        WHERE shadow_id = $1

        RETURNING *;
        `;

        const { rows } = await db.query(query, [

            shadowId,
            data.status,
            data.feedback,
            completedAt

        ]);

        return rows[0];
    }

}

module.exports = new ShadowAssignmentRepository();