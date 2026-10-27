const pool = require("../config/db");

class TagAssignmentRepository {

    /* ---------------- ARTICLE ---------------- */

    async assignArticleTag(articleId, tagId) {

        await pool.query(
            `
            INSERT INTO article_tags(article_id, tag_id)
            VALUES($1,$2)
            ON CONFLICT DO NOTHING
            `,
            [articleId, tagId]
        );

    }

    async getArticleTags(articleId) {

        const result = await pool.query(
            `
            SELECT
                et.tag_id,
                et.tag_name
            FROM article_tags at
            JOIN expertise_tags et
            ON at.tag_id = et.tag_id
            WHERE at.article_id = $1
            `,
            [articleId]
        );

        return result.rows;

    }

    /* ---------------- SECTION ---------------- */

    async assignSectionTag(sectionId, tagId) {

        await pool.query(
            `
            INSERT INTO section_tags(section_id, tag_id)
            VALUES($1,$2)
            ON CONFLICT DO NOTHING
            `,
            [sectionId, tagId]
        );

    }

    async getSectionTags(sectionId) {

        const result = await pool.query(
            `
            SELECT
                et.tag_id,
                et.tag_name
            FROM section_tags st
            JOIN expertise_tags et
            ON st.tag_id = et.tag_id
            WHERE st.section_id = $1
            `,
            [sectionId]
        );

        return result.rows;

    }

    /* ---------------- ATTACHMENT ---------------- */

    async assignAttachmentTag(attachmentId, tagId) {

        await pool.query(
            `
            INSERT INTO attachment_tags(attachment_id, tag_id)
            VALUES($1,$2)
            ON CONFLICT DO NOTHING
            `,
            [attachmentId, tagId]
        );

    }

    async getAttachmentTags(attachmentId) {

        const result = await pool.query(
            `
            SELECT
                et.tag_id,
                et.tag_name
            FROM attachment_tags at
            JOIN expertise_tags et
            ON at.tag_id = et.tag_id
            WHERE at.attachment_id = $1
            `,
            [attachmentId]
        );

        return result.rows;

    }

}

module.exports = new TagAssignmentRepository();