const pool = require("../config/db");

class DuplicateDetectionRepository {

    async getCandidateArticles(keyword, currentArticleId) {

        const result = await pool.query(
            `
            SELECT
                article_id,
                title,
                summary,
                module,
                content,
                tags
            FROM knowledge_articles
            WHERE
                status='published'
                AND article_id <> $2
                AND
                (
                    title ILIKE $1
                    OR summary ILIKE $1
                    OR module ILIKE $1
                    OR content ILIKE $1
                )
            LIMIT 8
            `,
            [`%${keyword}%`, currentArticleId]
        );

        return result.rows;
    }

}

module.exports = new DuplicateDetectionRepository();