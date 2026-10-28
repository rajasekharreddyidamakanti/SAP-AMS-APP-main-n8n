const pool = require("../config/db");

class ArticleRepository {

    async createArticle(data) {

        const {
            title,
            summary,
            content,
            module,
            severity,
            visibility,
            status,
            tags,
            department,
            createdBy,
            co_author_id,
            project_name
        } = data;

        const result = await pool.query(
            `
            INSERT INTO knowledge_articles
            (
                title,
                summary,
                content,
                module,
                severity,
                visibility,
                status,
                tags,
                department,
                created_by,
                co_author_id,
                co_author_status,
                project_name
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
            RETURNING *
            `,
            [
                title,
                summary,
                content,
                module,
                severity,
                visibility,
                co_author_id ? "co_author_pending" : status,
                tags,
                department,
                createdBy,
                co_author_id || null,
                co_author_id ? "pending" : null,
                project_name || null
            ]
        );

        return result.rows[0];

    }

    async getAllArticles(userId) {

        const result = await pool.query(
            `
            SELECT DISTINCT ka.*
            FROM knowledge_articles ka

            LEFT JOIN article_visibility_roles avr
            ON ka.article_id = avr.article_id

            LEFT JOIN user_roles ur
            ON avr.role_id = ur.role_id
            AND ur.user_id = $1

            WHERE
                ka.created_by = $1
                OR EXISTS (
                    SELECT 1
                    FROM user_roles admin_ur
                    JOIN roles admin_r ON admin_r.role_id = admin_ur.role_id
                    WHERE admin_ur.user_id = $1
                      AND LOWER(admin_r.role_name) = 'admin'
                )
                OR (
                    ka.status = 'published'
                    AND (
                        ka.visibility = 'public'
                        OR (
                            ka.visibility = 'restricted'
                            AND ur.user_id IS NOT NULL
                        )
                    )
                )

            ORDER BY ka.created_at DESC
            `,
            [userId]
        );

        return result.rows;
    }

    async getArticleById(id) {

        const result = await pool.query(
            `
            SELECT *
            FROM knowledge_articles
            WHERE article_id = $1
            `,
            [id]
        );

        return result.rows[0];
    }

    async getArticleForUser(id, userId) {

        const result = await pool.query(
            `
            SELECT DISTINCT ka.*
            FROM knowledge_articles ka
            LEFT JOIN article_visibility_roles avr
              ON ka.article_id = avr.article_id
            LEFT JOIN user_roles ur
              ON avr.role_id = ur.role_id
             AND ur.user_id = $2
            WHERE ka.article_id = $1
              AND (
                ka.created_by = $2
                OR EXISTS (
                    SELECT 1
                    FROM user_roles admin_ur
                    JOIN roles admin_r ON admin_r.role_id = admin_ur.role_id
                    WHERE admin_ur.user_id = $2
                      AND LOWER(admin_r.role_name) = 'admin'
                )
                OR (
                    ka.status = 'published'
                    AND (
                        ka.visibility = 'public'
                        OR (
                            ka.visibility = 'restricted'
                            AND ur.user_id IS NOT NULL
                        )
                    )
                )
              )
            `,
            [id, userId]
        );

        return result.rows[0];

    }

    async getAttachments(articleId) {

        const result = await pool.query(
            `
            SELECT *
            FROM article_attachments
            WHERE article_id=$1
            `,
            [articleId]
        );

        return result.rows;

    }

    async updateArticle(id, data) {

        const {
            title,
            summary,
            content,
            module,
            severity,
            visibility,
            status,
            tags,
            department,
            project_name
        } = data;

        const result = await pool.query(
            `
            UPDATE knowledge_articles
            SET
            title=COALESCE($1,title),
            summary=COALESCE($2,summary),
            content=COALESCE($3,content),
            module=COALESCE($4,module),
            severity=COALESCE($5,severity),
            visibility=COALESCE($6,visibility),
            status=COALESCE($7,status),
            tags=COALESCE($8,tags),
            department=COALESCE($9,department),
            project_name=COALESCE($10,project_name),
            updated_at=CURRENT_TIMESTAMP
            WHERE article_id=$11
            RETURNING *
            `,
            [
                title,
                summary,
                content,
                module,
                severity,
                visibility,
                status,
                tags,
                department,
                project_name,
                id
            ]
        );

        return result.rows[0];

    }

    async getPendingArticles() {

        const result = await pool.query(
            `
            SELECT
                article_id,
                title,
                summary,
                module,
                severity,
                status,
                visibility,
                department,
                created_by,
                created_at
            FROM knowledge_articles
            WHERE status='under_review'
            ORDER BY created_at DESC
            `
        );

        return result.rows;

    }

    async getArticleAuthor(id) {

        const result = await pool.query(
            `
            SELECT created_by
            FROM knowledge_articles
            WHERE article_id=$1
            `,
            [id]
        );

        return result.rows[0];

    }

    async getAuthorDepartment(userId) {
        const result = await pool.query(
            `SELECT department
            FROM users
            WHERE user_id = $1`,
            [userId]
        );
        return result.rows[0]?.department || null;

    }

    async getAuthorRoles(userId) {
        const result = await pool.query(
            `SELECT r.role_name
            FROM user_roles ur
            JOIN roles r
                ON ur.role_id = r.role_id
            WHERE ur.user_id = $1`,
            [userId]
        );
        return result.rows.map(role => role.role_name);

    }

    async approveArticle(id, tags) {

        const result = await pool.query(
            `
            UPDATE knowledge_articles
            SET
                status='published',
                tags=(
                    SELECT ARRAY(
                        SELECT DISTINCT
                        unnest(
                            COALESCE(tags,ARRAY[]::text[])
                            || $1::text[]
                        )
                    )
                ),
                updated_at=CURRENT_TIMESTAMP
            WHERE article_id=$2
            RETURNING *
            `,
            [tags, id]
        );

        return result.rows[0];

    }

    async rejectArticle(id, reason) {

        const result = await pool.query(
            `
            UPDATE knowledge_articles
            SET
                status='rejected',
                rejection_reason=$1,
                updated_at=CURRENT_TIMESTAMP
            WHERE article_id=$2
            RETURNING *
            `,
            [reason, id]
        );

        return result.rows[0];

    }

    async coAuthorApproveArticle(id, userId) {
        const result = await pool.query(
            `
            UPDATE knowledge_articles
            SET
                co_author_status = 'approved',
                status = 'under_review',
                updated_at = NOW()
            WHERE article_id = $1 AND co_author_id = $2
            RETURNING *
            `,
            [id, userId]
        );
        return result.rows[0];
    }

    async searchArticles(keyword,userId){

        const result=await pool.query(
            `SELECT DISTINCT ka.*
            FROM knowledge_articles ka
            LEFT JOIN article_visibility_roles avr
            ON ka.article_id=avr.article_id

            LEFT JOIN user_roles ur
            ON avr.role_id=ur.role_id
            AND ur.user_id=$2

            WHERE

            (

                ka.title ILIKE $1
                OR ka.summary ILIKE $1
                OR ka.content ILIKE $1
                OR ka.module ILIKE $1

            )

            AND (
                ka.created_by = $2
                OR EXISTS (
                    SELECT 1
                    FROM user_roles admin_ur
                    JOIN roles admin_r ON admin_r.role_id = admin_ur.role_id
                    WHERE admin_ur.user_id = $2
                      AND LOWER(admin_r.role_name) = 'admin'
                )
                OR (
                    ka.status = 'published'
                    AND (
                        ka.visibility = 'public'
                        OR (
                            ka.visibility = 'restricted'
                            AND ur.user_id IS NOT NULL
                        )
                    )
                )
            )

            `,
            [`%${keyword}%`,userId]
        );

        return result.rows;

    }

    async getArticleExperts(articleId) {
        // Fetch article metadata to know author, co-author and department
        const articleResult = await pool.query(
            `SELECT created_by, co_author_id, department FROM knowledge_articles WHERE article_id = $1`,
            [articleId]
        );
        if (!articleResult.rows.length) return { primaryAuthor: null, coAuthor: null, departmentExperts: [] };
        
        const { created_by, co_author_id, department } = articleResult.rows[0];

        // Fetch user objects
        const usersResult = await pool.query(
            `SELECT user_id, name, email FROM users WHERE user_id = $1 OR (user_id = $2 AND $2 IS NOT NULL)`,
            [created_by, co_author_id]
        );
        
        let primaryAuthor = null;
        let coAuthor = null;
        
        for (const u of usersResult.rows) {
            if (u.user_id === created_by) primaryAuthor = u;
            if (u.user_id === co_author_id) coAuthor = u;
        }

        // Fetch other department experts
        const deptExperts = await pool.query(
            `SELECT u.user_id, u.name, u.email 
             FROM users u
             JOIN user_roles ur ON u.user_id = ur.user_id
             JOIN roles r ON ur.role_id = r.role_id
             WHERE u.department = $1 
               AND r.role_name IN ('Expert', 'Team Lead') 
               AND u.user_id != $2 
               AND (u.user_id != $3 OR $3 IS NULL)`,
            [department, created_by, co_author_id]
        );

        return {
            primaryAuthor,
            coAuthor,
            departmentExperts: deptExperts.rows
        };
    }

    async deleteArticle(id) {

        const result = await pool.query(
            `
            DELETE FROM knowledge_articles
            WHERE article_id=$1
            RETURNING *
            `,
            [id]
        );

        return result.rows[0];

    }

    async getArticleOwner(id){

        const result = await pool.query(
            `
            SELECT
                article_id,
                created_by,
                status
            FROM knowledge_articles
            WHERE article_id=$1
            `,
            [id]
        );
        return result.rows[0];
    }
    async saveEditHistory(articleId, editedBy, changes) {

        await pool.query(
            `
            INSERT INTO article_edit_history
            (
                article_id,
                edited_by,
                changes
            )
            VALUES ($1,$2,$3)
            `,
            [
                articleId,
                editedBy,
                JSON.stringify(changes)
            ]
        );
    }

    async getEditHistory(articleId){

        const result = await pool.query(
            `
            SELECT
                h.*,
                u.name AS full_name
            FROM article_edit_history h
            JOIN users u
            ON h.edited_by=u.user_id
            WHERE article_id=$1
            ORDER BY edited_at DESC
            `,
            [articleId]
        );

        return result.rows;

    }

    async getPublishedArticles(currentArticleId){

        const result = await pool.query(
            `
            SELECT
                article_id,
                title,
                summary,
                content,
                module,
                department,
                severity,
                tags
            FROM knowledge_articles
            WHERE status='published'
            AND article_id <> $1
            `,
            [currentArticleId]
        );
        return result.rows;
    }

    async saveEmbedding(articleId, embedding) {

        await pool.query(
            `
            UPDATE knowledge_articles
            SET embedding=$1
            WHERE article_id=$2
            `,
            [
                JSON.stringify(embedding),
                articleId
            ]
        );

    }

    async findSimilarArticles(queryEmbedding, limit = 5) {

        const result = await pool.query(
            `
            SELECT
                article_id,
                title,
                summary,
                content,
                module,
                visibility,
                embedding
            FROM knowledge_articles
            WHERE
                status='published'
                AND embedding IS NOT NULL
            `
        );

        const cosineSimilarity = (a, b) => {

            let dot = 0;
            let magA = 0;
            let magB = 0;

            for (let i = 0; i < a.length; i++) {

                dot += a[i] * b[i];
                magA += a[i] * a[i];
                magB += b[i] * b[i];

            }

            return dot /
                (Math.sqrt(magA) * Math.sqrt(magB));
        };

        const ranked = result.rows.map(article => ({

            ...article,

            score: cosineSimilarity(
                queryEmbedding,
                article.embedding
            )
        }));

        ranked.sort(
            (a, b) => b.score - a.score
        );

        return ranked.slice(0, limit);
    }

    async updateEmbedding(articleId, embedding) {

        const result = await pool.query(
            `
            UPDATE knowledge_articles
            SET embedding = $1
            WHERE article_id = $2
            RETURNING article_id
            `,
            [
                JSON.stringify(embedding),
                articleId
            ]
        );

        return result.rows[0];

    }


    async getArticleForEmbedding(articleId) {

        const result = await pool.query(
            `
            SELECT
                article_id,
                title,
                summary,
                content,
                module,
                severity,
                department,
                tags
            FROM knowledge_articles
            WHERE article_id = $1
            `,
            [articleId]
        );

        return result.rows[0];

    }

    async getPublishedArticlesWithoutEmbedding() {

        const result = await pool.query(
            `
            SELECT
                article_id,
                title,
                summary,
                content,
                module,
                department,
                severity,
                tags
            FROM knowledge_articles
            WHERE status='published'
            AND embedding IS NULL
            `
        );

        return result.rows;
    }


}

module.exports = new ArticleRepository();