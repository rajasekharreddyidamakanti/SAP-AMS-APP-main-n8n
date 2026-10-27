const pool = require("../config/db");

class SectionRepository {

    async createSection(data) {
        const { article_id, title, content, tags } = data;

        const result = await pool.query(
            `
            INSERT INTO article_sections
            (
                article_id,
                title,
                content,
                tags
            )
            VALUES ($1,$2,$3,$4)
            RETURNING *
            `,
            [
                article_id,
                title,
                content,
                tags || []
            ]
        );

        return result.rows[0];
    }

    async getSectionsByArticle(articleId) {

        const result = await pool.query(
            `
            SELECT *
            FROM article_sections
            WHERE article_id=$1
            ORDER BY section_id
            `,
            [articleId]
        );

        return result.rows;
    }

    async getSectionById(id) {

        const result = await pool.query(
            `
            SELECT *
            FROM article_sections
            WHERE section_id=$1
            `,
            [id]
        );

        return result.rows[0];
    }

    async updateSection(id, data) {

        const {
            title,
            content,
            tags
        } = data;

        const result = await pool.query(
            `
            UPDATE article_sections
            SET
                title=$1,
                content=$2,
                tags=$3
            WHERE section_id=$4
            RETURNING *
            `,
            [
                title,
                content,
                tags || [],
                id
            ]
        );

        return result.rows[0];
    }

    async deleteSection(id) {

        const result = await pool.query(
            `
            DELETE FROM article_sections
            WHERE section_id=$1
            RETURNING *
            `,
            [id]
        );

        return result.rows[0];
    }

}

module.exports = new SectionRepository();