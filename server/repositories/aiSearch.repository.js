const pool = require("../config/db");

class AISearchRepository {

    async getPublishedArticles() {

        const result = await pool.query(`
            SELECT
                article_id,
                title,
                summary,
                content,
                module,
                department,
                severity,
                tags,
                visibility,
                embedding
            FROM knowledge_articles
            WHERE status='published'
            AND embedding IS NOT NULL
        `);

        return result.rows;
    }

}

module.exports = new AISearchRepository();