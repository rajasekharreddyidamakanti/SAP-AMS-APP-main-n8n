// const db = require("../config/db");
// const CHAT_STATUS =require("../constants/chatStatus");

// class ExpertRequestRepository {

//     async createRequest(data) {

//         const query = `

//             INSERT INTO expert_requests
//             (
//                 user_id,
//                 expert_id,
//                 query,
//                 module,
//                 article_id,
//                 status,
//                 deadline
//             )

//             VALUES
//             ($1,$2,$3,$4,$5,$6,$7)

//             RETURNING *;

//         `;

//         const values = [

//             data.user_id,
//             data.expert_id,
//             data.query,
//             data.module,
//             data.article_id,
//             data.status,
//             data.deadline

//         ];

//         const { rows } =
//         await db.query(query, values);

//         return rows[0];

//     }

//     // async getPendingRequests(expertId) {

//     //     const query = `
//     //     SELECT *
//     //     FROM expert_requests
//     //     WHERE expert_id=$1
//     //     AND status=$2
//     //     ORDER BY created_at DESC;
//     //     `;

//     //     const { rows } =
//     //     await db.query(query, [

//     //         expertId,

//     //         CHAT_STATUS.REQUEST.PENDING

//     //     ]);
//     //     // Changed for testing the project ,Removed the [0] from the code
//     //     return rows;
    
//     async reassignRequest(requestId, newExpertId) {

//         const { rows } =
//         await db.query(
//             `UPDATE expert_requests
//              SET expert_id = $1, status = $2
//              WHERE request_id = $3
//              RETURNING *`,
//             [newExpertId, CHAT_STATUS.REQUEST.PENDING, requestId]
//         );

//         return rows[0];

//     }

    

// async updateStatus(requestId, status) {

//         const acceptedAt =
//             status === CHAT_STATUS.REQUEST.ACCEPTED
//                 ? new Date()
//                 : null;

//         const query = `
//             UPDATE expert_requests
//             SET
//                 status = $2,
//                 accepted_at = COALESCE($3, accepted_at)
//             WHERE request_id = $1
//             RETURNING *;
//         `;

//         const { rows } = await db.query(query, [
//             requestId,
//             status,
//             acceptedAt
//         ]);

//         return rows[0];
//     }
//     async getRequestById(requestId) {

//         const query = `
//             SELECT *
//             FROM expert_requests
//             WHERE request_id = $1;
//         `;

//         const { rows } = await db.query(query, [requestId]);

//         return rows[0];
//     }

//     async getExpiredRequests() {

//         const query = `
//         SELECT *
//         FROM expert_requests
//         WHERE status = $1
//         AND deadline <= NOW()
//         AND timeout_processed = false;
//         `;

//         const { rows } = await db.query(query, [
//             CHAT_STATUS.REQUEST.PENDING
//         ]);

//         return rows;
//     }

//     async markTimeoutProcessed(requestId) {

//         const query = `
//             UPDATE expert_requests
//             SET timeout_processed = true
//             WHERE request_id = $1
//         `;

//         await db.query(query, [requestId]);
//     }

//     async extendDeadline(requestId, deadline) {

//         const query = `
//             UPDATE expert_requests
//             SET
//                 status = $2,
//                 deadline = $3,
//                 timeout_processed = false
//             WHERE request_id = $1
//             RETURNING *;
//         `;

//         const { rows } = await db.query(query, [

//             requestId,

//             CHAT_STATUS.REQUEST.PENDING,

//             deadline

//         ]);

//         return rows[0];
//     }

//     async transferExpert(requestId, expertId, deadline) {

//         const query = `
//             UPDATE expert_requests
//             SET
//                 expert_id = $2,
//                 status = $3,
//                 deadline = $4,
//                 timeout_processed = false
//             WHERE request_id = $1
//             RETURNING *;
//         `;

//         const { rows } = await db.query(query, [
//             requestId,
//             expertId,
//             CHAT_STATUS.REQUEST.PENDING,
//             deadline
//         ]);
//         return rows[0];
//     }

//     async createTransferredRequest(data) {
//         return await this.createRequest(data);
//     }

// }

// module.exports =
// new ExpertRequestRepository();

// changed for Testing the Database


// const db = require("../config/db");
// const CHAT_STATUS = require("../constants/chatStatus");

// class ExpertRequestRepository {

//     // =========================================================
//     // CREATE REQUEST
//     // =========================================================
//     async createRequest(data) {

//         const query = `
//             INSERT INTO expert_requests
//             (
//                 user_id,
//                 expert_id,
//                 query,
//                 module,
//                 article_id,
//                 status,
//                 deadline
//             )
//             VALUES
//             ($1, $2, $3, $4, $5, $6, $7)
//             RETURNING *;
//         `;

//         const values = [
//             data.user_id,
//             data.expert_id,
//             data.query,
//             data.module,
//             data.article_id,
//             data.status,
//             data.deadline
//         ];

//         const { rows } = await db.query(query, values);

//         return rows[0];
//     }


//     // =========================================================
//     // GET PENDING REQUESTS FOR A PARTICULAR EXPERT
//     // Used by Expert Requests page
//     // =========================================================
//     async getPendingRequests(expertId) {

//         const query = `
//             SELECT
//                 er.*,
//                 u.name AS requester_name,
//                 u.email AS requester_email
//             FROM expert_requests er
//             LEFT JOIN users u
//                 ON u.user_id = er.user_id
//             WHERE er.expert_id = $1
//               AND er.status = $2
//             ORDER BY er.created_at DESC;
//         `;

//         const { rows } = await db.query(query, [
//             expertId,
//             CHAT_STATUS.REQUEST.PENDING
//         ]);

//         return rows;
//     }


//     // =========================================================
//     // GET ALL PENDING REQUESTS
//     // Used by ADMIN
//     // Admin can see all pending requests and assign them
//     // =========================================================
//     async getAllPendingRequests() {

//         const query = `
//             SELECT
//                 er.*,
//                 u.name AS requester_name,
//                 u.email AS requester_email
//             FROM expert_requests er
//             LEFT JOIN users u
//                 ON u.user_id = er.user_id
//             WHERE er.status = $1
//             ORDER BY er.created_at DESC;
//         `;

//         const { rows } = await db.query(query, [
//             CHAT_STATUS.REQUEST.PENDING
//         ]);

//         return rows;
//     }


//     // =========================================================
//     // GET REQUEST BY ID
//     // =========================================================
//     async getRequestById(requestId) {

//         const query = `
//             SELECT *
//             FROM expert_requests
//             WHERE request_id = $1;
//         `;

//         const { rows } = await db.query(query, [requestId]);

//         return rows[0];
//     }


//     // =========================================================
//     // UPDATE REQUEST STATUS
//     // =========================================================
//     async updateStatus(requestId, status) {

//         const acceptedAt =
//             status === CHAT_STATUS.REQUEST.ACCEPTED
//                 ? new Date()
//                 : null;

//         const query = `
//             UPDATE expert_requests
//             SET
//                 status = $2,
//                 accepted_at = COALESCE($3, accepted_at)
//             WHERE request_id = $1
//             RETURNING *;
//         `;

//         const { rows } = await db.query(query, [
//             requestId,
//             status,
//             acceptedAt
//         ]);

//         return rows[0];
//     }


//     // =========================================================
//     // GET EXPIRED REQUESTS
//     // =========================================================
//     async getExpiredRequests() {

//         const query = `
//             SELECT *
//             FROM expert_requests
//             WHERE status = $1
//               AND deadline <= NOW()
//               AND timeout_processed = false;
//         `;

//         const { rows } = await db.query(query, [
//             CHAT_STATUS.REQUEST.PENDING
//         ]);

//         return rows;
//     }


//     // =========================================================
//     // MARK TIMEOUT PROCESSED
//     // =========================================================
//     async markTimeoutProcessed(requestId) {

//         const query = `
//             UPDATE expert_requests
//             SET timeout_processed = true
//             WHERE request_id = $1;
//         `;

//         await db.query(query, [requestId]);
//     }


//     // =========================================================
//     // EXTEND DEADLINE
//     // =========================================================
//     async extendDeadline(requestId, deadline) {

//         const query = `
//             UPDATE expert_requests
//             SET
//                 status = $2,
//                 deadline = $3,
//                 timeout_processed = false
//             WHERE request_id = $1
//             RETURNING *;
//         `;

//         const { rows } = await db.query(query, [
//             requestId,
//             CHAT_STATUS.REQUEST.PENDING,
//             deadline
//         ]);

//         return rows[0];
//     }


//     // =========================================================
//     // TRANSFER REQUEST TO ANOTHER EXPERT
//     // =========================================================
//     async transferExpert(requestId, expertId, deadline) {

//         const query = `
//             UPDATE expert_requests
//             SET
//                 expert_id = $2,
//                 status = $3,
//                 deadline = $4,
//                 timeout_processed = false
//             WHERE request_id = $1
//             RETURNING *;
//         `;

//         const { rows } = await db.query(query, [
//             requestId,
//             expertId,
//             CHAT_STATUS.REQUEST.PENDING,
//             deadline
//         ]);

//         return rows[0];
//     }


//     // =========================================================
//     // CREATE TRANSFERRED REQUEST
//     // =========================================================
//     async createTransferredRequest(data) {

//         return await this.createRequest(data);
//     }
// }

// module.exports = new ExpertRequestRepository();

const db = require("../config/db");
const CHAT_STATUS =require("../constants/chatStatus");

class ExpertRequestRepository {

    async createRequest(data) {

        const query = `

            INSERT INTO expert_requests
            (
                user_id,
                expert_id,
                query,
                module,
                article_id,
                status,
                deadline
            )

            VALUES
            ($1,$2,$3,$4,$5,$6,$7)

            RETURNING *;

        `;

        const values = [

            data.user_id,
            data.expert_id,
            data.query,
            data.module,
            data.article_id,
            data.status,
            data.deadline

        ];

        const { rows } =
        await db.query(query, values);

        return rows[0];

    }

    // Fetches everything currently sitting with this user that needs
    // their action — either freshly pending (unassigned/with Admin) or
    // assigned specifically to them by an Admin.
    async getPendingRequests(expertId) {

        const query = `
        SELECT *
        FROM expert_requests
        WHERE expert_id=$1
        AND status IN ($2, $3)
        ORDER BY created_at DESC;
        `;

        const { rows } =
        await db.query(query, [

            expertId,

            CHAT_STATUS.REQUEST.PENDING,

            CHAT_STATUS.REQUEST.ASSIGNED

        ]);

        return rows;

    }

    // 

        async getRequestsByUser(userId) {

        const query = `
        SELECT
            er.*,
            u.name AS expert_name,
            u.email AS expert_email
        FROM expert_requests er
        LEFT JOIN users u ON u.user_id = er.expert_id
        WHERE er.user_id = $1
        ORDER BY er.created_at DESC;
        `;

        const { rows } = await db.query(query, [userId]);

        return rows;

    }

    async deleteRequest(requestId) {

        const query = `
            DELETE FROM expert_requests
            WHERE request_id = $1
            RETURNING *;
        `;

        const { rows } = await db.query(query, [requestId]);

        return rows[0];

    }

    // Everything a specific user has ever submitted, with the current
    // assignee's name attached, so the employee can see where it stands.
    async getMyRequests(userId) {

        const query = `
        SELECT er.*, u.name AS assigned_to_name, u.email AS assigned_to_email,
               u.department AS assigned_to_department, u.phone_number AS assigned_to_phone
        FROM expert_requests er
        LEFT JOIN users u ON er.expert_id = u.user_id
        WHERE er.user_id = $1
        ORDER BY er.created_at DESC;
        `;

        const { rows } = await db.query(query, [userId]);

        return rows;

    }
    

    
    // Admin-wide overview — every expert request in the system, regardless
    // of who it's currently assigned to, with both requester and assignee
    // details attached so Admin can see the full picture at a glance.
    async getAllRequests() {

        const query = `
        SELECT er.*,
               req.name AS requester_name, req.email AS requester_email,
               exp.name AS assigned_to_name, exp.email AS assigned_to_email,
               exp.department AS assigned_to_department, exp.phone_number AS assigned_to_phone
        FROM expert_requests er
        LEFT JOIN users req ON er.user_id = req.user_id
        LEFT JOIN users exp ON er.expert_id = exp.user_id
        ORDER BY er.created_at DESC;
        `;

        const { rows } = await db.query(query);

        return rows;

    }
    // Admin hands off a request (currently sitting with them) to a
    // specific expert. Status becomes "assigned" so it's distinguishable
    // from a fresh, unassigned "pending" request.
    async reassignRequest(requestId, newExpertId) {

        const query = `
            UPDATE expert_requests
            SET expert_id = $1, status = $2
            WHERE request_id = $3
            RETURNING *;
        `;

        const { rows } = await db.query(query, [

            newExpertId,

            CHAT_STATUS.REQUEST.ASSIGNED,

            requestId

        ]);

        return rows[0];
    }

    async updateStatus(requestId, status) {

        const acceptedAt =
            status === CHAT_STATUS.REQUEST.ACCEPTED
                ? new Date()
                : null;

        const query = `
            UPDATE expert_requests
            SET
                status = $2,
                accepted_at = COALESCE($3, accepted_at)
            WHERE request_id = $1
            RETURNING *;
        `;

        const { rows } = await db.query(query, [
            requestId,
            status,
            acceptedAt
        ]);

        return rows[0];
    }

    async getRequestById(requestId) {

        const query = `
            SELECT *
            FROM expert_requests
            WHERE request_id = $1;
        `;

        const { rows } = await db.query(query, [requestId]);

        return rows[0];
    }

    async getExpiredRequests() {

        const query = `
        SELECT *
        FROM expert_requests
        WHERE status = $1
        AND deadline <= NOW()
        AND timeout_processed = false;
        `;

        const { rows } = await db.query(query, [
            CHAT_STATUS.REQUEST.PENDING
        ]);

        return rows;
    }

    async markTimeoutProcessed(requestId) {

        const query = `
            UPDATE expert_requests
            SET timeout_processed = true
            WHERE request_id = $1
        `;

        await db.query(query, [requestId]);
    }

    async extendDeadline(requestId, deadline) {

        const query = `
            UPDATE expert_requests
            SET
                status = $2,
                deadline = $3,
                timeout_processed = false
            WHERE request_id = $1
            RETURNING *;
        `;

        const { rows } = await db.query(query, [

            requestId,

            CHAT_STATUS.REQUEST.PENDING,

            deadline

        ]);

        return rows[0];
    }

    
    async deleteRequest(requestId) {
        await db.query(`DELETE FROM expert_requests WHERE request_id = $1`, [requestId]);
    }

    async transferExpert(requestId, expertId, deadline) {

        const query = `
            UPDATE expert_requests
            SET
                expert_id = $2,
                status = $3,
                deadline = $4,
                timeout_processed = false
            WHERE request_id = $1
            RETURNING *;
        `;

        const { rows } = await db.query(query, [
            requestId,
            expertId,
            CHAT_STATUS.REQUEST.PENDING,
            deadline
        ]);
        return rows[0];
    }

    async createTransferredRequest(data) {
        return await this.createRequest(data);
    }

}

module.exports =
new ExpertRequestRepository();