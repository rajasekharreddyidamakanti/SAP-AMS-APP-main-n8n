const db = require("../config/db");
const CHAT_STATUS = require("../constants/chatStatus");

class ChatRepository {

    async createSession(requestId) {

        const query = `
            INSERT INTO chat_sessions
            (
                request_id,
                status,
                started_at
            )
            VALUES
            (
                $1,
                $2,
                CURRENT_TIMESTAMP
            )
            RETURNING *;
        `;

        const { rows } = await db.query(query, [
            requestId,
            CHAT_STATUS.SESSION.ACTIVE
        ]);

        return rows[0];
    }

    async getSessionByRequestId(requestId) {

        const query = `
            SELECT *
            FROM chat_sessions
            WHERE request_id = $1;
        `;

        const { rows } = await db.query(query, [requestId]);

        return rows[0];
    }

    async createMessage(data){

        const query = `
            INSERT INTO chat_messages
            (
                session_id,
                sender_id,
                message
            )
            VALUES
            ($1, $2, $3)
            RETURNING *;
        `;

        const { rows } = await db.query(query, [
            data.session_id,
            data.sender_id,
            data.message
        ]);

        return rows[0];
    }

    async getMessages(sessionId) {

        const query = `
            SELECT
                cm.*,
                u.name AS sender_name
            FROM chat_messages cm
            JOIN users u
            ON cm.sender_id = u.user_id
            WHERE cm.session_id = $1
            ORDER BY cm.created_at ASC;
        `;

        const { rows } = await db.query(query, [sessionId]);

        return rows;
    }

    async getSessionById(sessionId) {

        const query = `
        SELECT
            cs.*,
            er.user_id AS requester_id,
            er.expert_id
        FROM chat_sessions cs
        JOIN expert_requests er
        ON cs.request_id = er.request_id
        WHERE cs.session_id = $1;
        `;

        const { rows } = await db.query(query, [sessionId]);

        return rows[0];
    }

    async markMessagesAsRead(sessionId, userId) {

        const query = `
            UPDATE chat_messages
            SET
                is_read = true,
                read_at = CURRENT_TIMESTAMP
            WHERE session_id = $1
            AND sender_id <> $2
            AND is_read = false;
        `;

        await db.query(query, [
            sessionId,
            userId
        ]);
    }

    async closeSession(sessionId, userId, reason) {

        const query = `
            UPDATE chat_sessions
            SET
                status = $2,
                closed_at = CURRENT_TIMESTAMP,
                closed_by = $3,
                close_reason = $4
            WHERE session_id = $1
            RETURNING *;
        `;

        const { rows } = await db.query(query, [
            sessionId,
            CHAT_STATUS.SESSION.CLOSED,
            userId,
            reason
        ]);

        return rows[0];
    }

    async getSessionDetails(sessionId) {

        const query = `
            SELECT
                cs.*,
                er.user_id,
                er.expert_id,
                u1.name AS user_name,
                u2.name AS expert_name
            FROM chat_sessions cs
            JOIN expert_requests er
                ON cs.request_id = er.request_id
            JOIN users u1
                ON er.user_id = u1.user_id
            JOIN users u2
                ON er.expert_id = u2.user_id
            WHERE cs.session_id = $1;
        `;

        const { rows } = await db.query(query, [sessionId]);

        return rows[0];
    }

    async getExpiredRequests() {

        const query = `

            SELECT *

            FROM expert_requests

            WHERE
                status = $1
            AND deadline <= CURRENT_TIMESTAMP
            AND timeout_processed = FALSE;

        `;

        const { rows } =
            await db.query(query, [

                CHAT_STATUS.REQUEST.PENDING

            ]);

        return rows;
    }

    async markTimeoutProcessed(requestId){

        const query=`

            UPDATE expert_requests

            SET timeout_processed=TRUE

            WHERE request_id=$1;

        `;

        await db.query(query,[requestId]);

    }

}

module.exports = new ChatRepository();