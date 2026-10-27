const pool = require("../config/db");

class DashboardRepository {

    async getTotalArticles() {

        const result = await pool.query(
            `SELECT COUNT(*) AS count
             FROM knowledge_articles`
        );

        return result.rows[0].count;
    }

    async getTotalAttachments() {

        const result = await pool.query(
            `SELECT COUNT(*) AS count
             FROM article_attachments`
        );

        return result.rows[0].count;
    }

    async getTotalUsers() {

        const result = await pool.query(
            `SELECT COUNT(*) AS count
             FROM users`
        );

        return result.rows[0].count;
    }

    async getPendingUsers() {

        const result = await pool.query(
            `SELECT COUNT(*) AS count
             FROM users
             WHERE approval_status='pending'`
        );

        return result.rows[0].count;
    }

    async getPendingArticles() {

        const result = await pool.query(
            `SELECT COUNT(*) AS count
             FROM knowledge_articles
             WHERE status='under_review'`
        );

        return result.rows[0].count;
    }

    async getTotalSections() {

        const result = await pool.query(
            `SELECT COUNT(*) AS count
             FROM article_sections`
        );

        return result.rows[0].count;
    }

    async getTotalTags() {

        const result = await pool.query(
            `SELECT COUNT(*) AS count
             FROM expertise_tags`
        );

        return result.rows[0].count;
    }

}

module.exports = new DashboardRepository();