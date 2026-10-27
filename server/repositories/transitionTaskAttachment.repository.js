const db = require("../config/db");

class TransitionTaskAttachmentRepository {
    async getTask(taskId) {
        const { rows } = await db.query(
            "SELECT task_id, transition_id FROM transition_tasks WHERE task_id = $1",
            [taskId]
        );
        return rows[0];
    }

    async create(data) {
        const { rows } = await db.query(
            `INSERT INTO transition_task_attachments
                (task_id, file_name, file_path, file_type, uploaded_by)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [data.taskId, data.fileName, data.filePath, data.fileType, data.uploadedBy]
        );
        return rows[0];
    }

    async list(taskId) {
        const { rows } = await db.query(
            `SELECT a.*, u.name AS uploaded_by_name
             FROM transition_task_attachments a
             LEFT JOIN users u ON u.user_id = a.uploaded_by
             WHERE a.task_id = $1
             ORDER BY a.uploaded_at DESC`,
            [taskId]
        );
        return rows;
    }

    async getById(attachmentId) {
        const { rows } = await db.query(
            "SELECT * FROM transition_task_attachments WHERE attachment_id = $1",
            [attachmentId]
        );
        return rows[0];
    }

    async delete(attachmentId) {
        const { rows } = await db.query(
            "DELETE FROM transition_task_attachments WHERE attachment_id = $1 RETURNING *",
            [attachmentId]
        );
        return rows[0];
    }
}

module.exports = new TransitionTaskAttachmentRepository();
