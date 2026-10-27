const pool = require("../config/db");

class TransitionAttachmentRepository {

    async getTransition(transitionId) {
        const result = await pool.query(
            `SELECT transition_id FROM transitions WHERE transition_id=$1`,
            [transitionId]
        );
        return result.rows[0];
    }

    async uploadAttachment(data) {
        const result = await pool.query(
            `INSERT INTO transition_attachments
             (transition_id, file_name, file_path, file_type, uploaded_by)
             VALUES ($1,$2,$3,$4,$5)
             RETURNING *`,
            [data.transitionId, data.fileName, data.filePath, data.fileType, data.uploadedBy]
        );
        return result.rows[0];
    }

    async getAttachmentsByTransition(transitionId) {
        const result = await pool.query(
            `SELECT * FROM transition_attachments WHERE transition_id=$1 ORDER BY uploaded_at DESC`,
            [transitionId]
        );
        return result.rows;
    }

    async getAttachment(id) {
        const result = await pool.query(
            `SELECT * FROM transition_attachments WHERE attachment_id=$1`,
            [id]
        );
        return result.rows[0];
    }

    async deleteAttachment(id) {
        const result = await pool.query(
            `DELETE FROM transition_attachments WHERE attachment_id=$1 RETURNING *`,
            [id]
        );
        return result.rows[0];
    }
}

module.exports = new TransitionAttachmentRepository();