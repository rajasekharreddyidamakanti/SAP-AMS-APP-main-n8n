const db = require("../config/db");

class NotificationRepository {

    async createNotification(data) {

        const query = `
            INSERT INTO notifications
            (
                user_id,
                type,
                title,
                message,
                reference_type,
                reference_id
            )
            VALUES
            ($1,$2,$3,$4,$5,$6)
            RETURNING *;
        `;

        const { rows } = await db.query(query, [

            data.user_id,
            data.type,
            data.title,
            data.message,
            data.reference_type,
            data.reference_id

        ]);

        return rows[0];
    }

    async getNotifications(userId) {

        const query = `
            SELECT *
            FROM notifications
            WHERE user_id=$1
            ORDER BY created_at DESC;
        `;

        const { rows } = await db.query(query,[userId]);

        return rows;
    }

    async markAsRead(notificationId,userId){

        const query=`
            UPDATE notifications
            SET
                is_read=TRUE,
                read_at=CURRENT_TIMESTAMP
            WHERE notification_id=$1
            AND user_id=$2
            RETURNING *;
        `;

        const {rows}=await db.query(query,[
            notificationId,
            userId
        ]);

        return rows[0];
    }

    async markAllAsRead(userId){

        const query=`
            UPDATE notifications
            SET
                is_read=TRUE,
                read_at=CURRENT_TIMESTAMP
            WHERE user_id=$1
            AND is_read=FALSE;
        `;

        await db.query(query,[userId]);
    }

}

module.exports = new NotificationRepository();