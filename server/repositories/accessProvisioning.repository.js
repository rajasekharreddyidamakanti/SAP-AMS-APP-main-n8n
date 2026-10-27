const db = require("../config/db");

class AccessProvisioningRepository {

    async createAccess(data) {

        const query = `
        INSERT INTO access_requests
        (
            member_id,
            system_name,
            status,
            remarks
        )
        VALUES
        ($1,$2,'pending',$3)
        RETURNING *;
        `;

        const { rows } = await db.query(query, [

            data.member_id,
            data.system_name,
            data.remarks

        ]);

        return rows[0];
    }

    async getMemberAccess(memberId) {

        const query = `
        SELECT *
        FROM access_requests
        WHERE member_id = $1
        ORDER BY access_id;
        `;

        const { rows } = await db.query(query, [memberId]);

        return rows;
    }

    async updateAccess(accessId, data) {

        let completedAt = null;

        if (data.status === "provisioned") {
            completedAt = new Date();
        }

        const query = `
        UPDATE access_requests
        SET

            status = COALESCE($2,status),

            remarks = COALESCE($3,remarks),

            completed_at = COALESCE($4,completed_at)

        WHERE access_id = $1

        RETURNING *;
        `;

        const { rows } = await db.query(query, [

            accessId,
            data.status,
            data.remarks,
            completedAt

        ]);

        return rows[0];
    }

}

module.exports = new AccessProvisioningRepository();