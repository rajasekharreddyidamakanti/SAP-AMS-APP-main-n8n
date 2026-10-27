const pool = require("../config/db");

class TagRepository {

    async requestTag(userId, tagName, deadline) {
        const result = await pool.query(
            `
            INSERT INTO tag_requests
            (user_id, tag_name, status, deadline)
            VALUES ($1,$2,'pending',$3)
            RETURNING *
            `,
            [userId, tagName, deadline]
        );

        return result.rows[0];
    }

    async getPendingTags() {
        const result = await pool.query(
            `
            SELECT *
            FROM tag_requests
            WHERE status='pending'
            ORDER BY requested_at ASC
            `
        );

        return result.rows;
    }

    async getTagRequest(id) {
        const result = await pool.query(
            `
            SELECT *
            FROM tag_requests
            WHERE request_id=$1
            `,
            [id]
        );

        return result.rows[0];
    }

    // async createExpertiseTag(tagName) {

    // // Check if tag already exists
    //     const existing = await pool.query(
    //         `
    //         SELECT tag_id
    //         FROM expertise_tags
    //         WHERE LOWER(tag_name) = LOWER($1)
    //         `,
    //         [tagName]
    //     );

    //     if (existing.rows.length > 0) {
    //         return existing.rows[0];
    //     }

    // // Create new tag
    //     const result = await pool.query(
    //         `
    //         INSERT INTO expertise_tags(tag_name)
    //         VALUES($1)
    //         RETURNING tag_id
    //         `,
    //         [tagName]
    //     );

    //     return result.rows[0];
    // }
// changed for testing the database

    async createExpertiseTag(tagName) {
        const existing = await pool.query(
            `
            SELECT tag_id
            FROM expertise_tags
            WHERE LOWER(tag_name) = LOWER($1)
            `,
            [tagName]
        );

        if (existing.rows.length > 0) {
            return existing.rows[0];
        }

        const result = await pool.query(
            `
            INSERT INTO expertise_tags
                (tag_name)
            VALUES ($1)
            RETURNING *
            `,
            [tagName]
        );

        return result.rows[0];
    }

    async assignTag(userId, tagId) {
        await pool.query(
            `
            INSERT INTO user_tags(user_id,tag_id)
            VALUES($1,$2)
            ON CONFLICT DO NOTHING
            `,
            [userId, tagId]
        );
    }

    async approveTag(id) {
        await pool.query(
            `
            UPDATE tag_requests
            SET status='approved'
            WHERE request_id=$1
            `,
            [id]
        );
    }

    async rejectTag(id) {
        await pool.query(
            `
            UPDATE tag_requests
            SET status='rejected'
            WHERE request_id=$1
            `,
            [id]
        );
    }

    async approveExpertiseTag(tagId) {
        // Approval is recorded on tag_requests. Keep this method for the
        // service workflow without requiring optional columns on expertise_tags.
        const result = await pool.query(
            `SELECT tag_id FROM expertise_tags WHERE tag_id = $1`,
            [tagId]
        );
        return result.rows[0];
    }

    // async getAllTags() {
    //     const result = await pool.query(
    //         `SELECT tag_id, tag_name, status, created_at
    //          FROM expertise_tags
    //          ORDER BY tag_name ASC`
    //     );
    //     return result.rows;
    // }

    // changed code for testing the data

    async getAllTags() {
        const result = await pool.query(`
            SELECT
            tag_id,
            tag_name,
            NULL::text AS description,
            'active'::text AS status,
            NULL::integer AS approved_by,
            NULL::timestamp AS approved_at
            FROM expertise_tags
            ORDER BY tag_name ASC
        `);

         return result.rows;
    }

    // async updateTag(tagId, tagName) {
    //     const result = await pool.query(
    //         `UPDATE expertise_tags
    //          SET tag_name = $1
    //          WHERE tag_id = $2
    //          RETURNING *`,
    //         [tagName, tagId]
    //     );
    //     return result.rows[0];
    // }

    // changed for testing the database
    async updateTag(tagId, tagName) {
        const result = await pool.query(
            `
            UPDATE expertise_tags
            SET tag_name = $1
            WHERE tag_id = $2
            RETURNING *
            `,
            [tagName, tagId]
        );

        return result.rows[0];
    }

    // async deleteTag(tagId) {
    //     await pool.query(
    //         `DELETE FROM expertise_tags WHERE tag_id = $1`,
    //         [tagId]
    //     );
    // }
    async deleteTag(tagId) {
        await pool.query(
            `
            DELETE FROM expertise_tags
            WHERE tag_id = $1
            `,
            [tagId]
        );
    }

    // async getPendingTagsWithDetails() {
    //     const result = await pool.query(
    //         `SELECT
    //             tr.request_id,
    //             tr.tag_name,
    //             tr.status,
    //             tr.requested_at,
    //             tr.deadline,
    //             u.user_id,
    //             u.name AS user_name,
    //             u.email AS user_email,
    //             u.department
    //          FROM tag_requests tr
    //          JOIN users u ON tr.user_id = u.user_id
    //          WHERE tr.status = 'pending'
    //          ORDER BY tr.requested_at ASC`
    //     );
    //     return result.rows;
    // }
    // 
    // changed for testing the database
    async getPendingTagsWithDetails() {
        const result = await pool.query(`
            SELECT
                tr.request_id,
                tr.tag_name,
                tr.status,
                tr.requested_at,
                tr.deadline,
                u.user_id,
                u.name AS user_name,
                u.email AS user_email,
                u.department
            FROM tag_requests tr
            INNER JOIN users u
                ON tr.user_id = u.user_id
            WHERE tr.status = 'pending'
            ORDER BY tr.requested_at ASC
        `);

        return result.rows;

    }
    // async getUsersWithTags() {
    //     const result = await pool.query(
    //         `SELECT
    //             u.user_id,
    //             u.name,
    //             u.email,
    //             u.department,
    //             COALESCE(
    //                 JSON_AGG(
    //                     JSON_BUILD_OBJECT('tag_id', t.tag_id, 'tag_name', t.tag_name)
    //                 ) FILTER (WHERE t.tag_id IS NOT NULL),
    //                 '[]'
    //             ) AS tags
    //          FROM users u
    //          LEFT JOIN user_tags ut ON u.user_id = ut.user_id
    //          LEFT JOIN expertise_tags t ON ut.tag_id = t.tag_id
    //          WHERE u.is_approved = true
    //          GROUP BY u.user_id, u.name, u.email, u.department
    //          ORDER BY u.name ASC`
    //     );
    //     return result.rows;
    // }

    // changed for testing the database 

    async getUsersWithTags() {
        const result = await pool.query(`
            SELECT
                u.user_id,
                u.name,
                u.email,
                u.department,
                COALESCE(
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'tag_id', t.tag_id,
                            'tag_name', t.tag_name
                        )
                    ) FILTER (WHERE t.tag_id IS NOT NULL),
                    '[]'::json
                ) AS tags
            FROM users u
            LEFT JOIN user_tags ut
                ON u.user_id = ut.user_id
            LEFT JOIN expertise_tags t
                ON ut.tag_id = t.tag_id
            WHERE u.is_approved = true
            GROUP BY
                u.user_id,
                u.name,
                u.email,
                u.department
            ORDER BY u.name ASC
        `);

        return result.rows;
    }

    async removeTagFromUser(userId, tagId) {
        await pool.query(
            `DELETE FROM user_tags WHERE user_id = $1 AND tag_id = $2`,
            [userId, tagId]
        );
    }

}

module.exports = new TagRepository();