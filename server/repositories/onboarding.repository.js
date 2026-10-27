const db = require("../config/db");

class OnboardingRepository {

    async createMember(data) {

        const query = `
        INSERT INTO onboarding_members
        (
            user_id,
            mentor_id,
            role_assigned,
            start_date,
            target_completion_date,
            overall_status,
            remarks,
            created_by
        )
        VALUES
        ($1,$2,$3,$4,$5,'not_started',$6,$7)
        RETURNING *;
        `;

        const { rows } = await db.query(query, [

            data.user_id,
            data.mentor_id,
            data.role_assigned,
            data.start_date,
            data.target_completion_date,
            data.remarks,
            data.created_by

        ]);

        return rows[0];
    }

    async getAllMembers() {

        const query = `
        SELECT
            om.*,
            u.name AS employee_name,
            m.name AS mentor_name
        FROM onboarding_members om
        JOIN users u
            ON om.user_id=u.user_id
        LEFT JOIN users m
            ON om.mentor_id=m.user_id
        ORDER BY member_id DESC;
        `;

        const { rows } = await db.query(query);

        return rows;
    }

    async getMemberById(memberId) {

        const query = `
        SELECT
            om.*,
            u.name AS employee_name,
            m.name AS mentor_name
        FROM onboarding_members om
        JOIN users u
            ON om.user_id=u.user_id
        LEFT JOIN users m
            ON om.mentor_id=m.user_id
        WHERE member_id=$1;
        `;

        const { rows } = await db.query(query,[memberId]);

        return rows[0];
    }

    async updateMember(memberId,data){

        const query=`
        UPDATE onboarding_members
        SET

            mentor_id=COALESCE($2,mentor_id),

            role_assigned=COALESCE($3,role_assigned),

            target_completion_date=
            COALESCE($4,target_completion_date),

            overall_status=
            COALESCE($5,overall_status),

            remarks=
            COALESCE($6,remarks)

        WHERE member_id=$1

        RETURNING *;
        `;

        const {rows}=await db.query(query,[

            memberId,
            data.mentor_id,
            data.role_assigned,
            data.target_completion_date,
            data.overall_status,
            data.remarks

        ]);

        return rows[0];
    }

}

module.exports = new OnboardingRepository();