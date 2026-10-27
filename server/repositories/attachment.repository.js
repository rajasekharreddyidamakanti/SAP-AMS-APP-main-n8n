const pool = require("../config/db");

class AttachmentRepository {

    async uploadAttachment(data) {

        const {
            articleId,
            fileName,
            filePath,
            fileType,
            uploadedBy,
            tags
        } = data;

        const result = await pool.query(
            `
            INSERT INTO article_attachments
            (
                article_id,
                file_name,
                file_path,
                file_type,
                uploaded_by
            )
            VALUES ($1,$2,$3,$4,$5)
            RETURNING *
            `,
            [
                articleId,
                fileName,
                filePath,
                fileType,
                uploadedBy
            ]
        );

        if (Array.isArray(tags) && tags.length > 0) {
            for (const tag of tags) {
                const normalizedTag = String(tag).trim();
                if (!normalizedTag) continue;

                const tagResult = await pool.query(
                    `
                    INSERT INTO expertise_tags (tag_name)
                    VALUES ($1)
                    ON CONFLICT (tag_name) DO UPDATE SET tag_name = EXCLUDED.tag_name
                    RETURNING tag_id
                    `,
                    [normalizedTag]
                );

                await pool.query(
                    `
                    INSERT INTO attachment_tags (attachment_id, tag_id)
                    VALUES ($1, $2)
                    ON CONFLICT DO NOTHING
                    `,
                    [result.rows[0].attachment_id, tagResult.rows[0].tag_id]
                );
            }
        }

        return result.rows[0];
    }

    async getArticle(articleId) {

        const result = await pool.query(
            `
            SELECT article_id
            FROM knowledge_articles
            WHERE article_id=$1
            `,
            [articleId]
        );

        return result.rows[0];
    }

    async getAttachment(id) {

        const result = await pool.query(
            `
            SELECT *
            FROM article_attachments
            WHERE attachment_id=$1
            `,
            [id]
        );

        return result.rows[0];
    }

    async getAttachmentsByArticle(articleId) {

        const result = await pool.query(
            `
            SELECT *
            FROM article_attachments
            WHERE article_id=$1
            ORDER BY uploaded_at DESC
            `,
            [articleId]
        );

        return result.rows;
    }

    async deleteAttachment(id) {

        const result = await pool.query(
            `
            DELETE FROM article_attachments
            WHERE attachment_id=$1
            RETURNING *
            `,
            [id]
        );

        return result.rows[0];
    }

}

module.exports = new AttachmentRepository();