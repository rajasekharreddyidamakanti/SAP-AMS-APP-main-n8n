const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const pool = require("../config/db");

// GET /api/profile/me
// Returns: user info (including phone) + their roles + their articles + their role requests
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;

        // 1. User info — include phone
        // const userResult = await pool.query(
        //     `SELECT user_id, name, email, department, phone, created_at
        //      FROM users WHERE user_id = $1`,
        //     [userId]
        // );
        const userResult = await pool.query(
                `SELECT user_id, name, email, department,
                        phone_number AS phone,
                        created_at
                FROM users
                WHERE user_id = $1`,
                [userId]
        );
        const user = userResult.rows[0];
        if (!user) return res.status(404).json({ message: "User not found" });

        // 2. Roles
        const rolesResult = await pool.query(
            `SELECT r.role_id, r.role_name
             FROM user_roles ur
             JOIN roles r ON ur.role_id = r.role_id
             WHERE ur.user_id = $1`,
            [userId]
        );

        // 3. Articles by this user (all statuses)
        const articlesResult = await pool.query(
            `SELECT article_id, title, status, module, department, created_at, updated_at
             FROM knowledge_articles
             WHERE created_by = $1
             ORDER BY created_at DESC`,
            [userId]
        );

        // 4. Role requests by this user
        // const roleRequestsResult = await pool.query(
        //     `SELECT rr.request_id, rr.status, rr.requested_at, rr.rejection_message,
        //             r.role_name, r.role_id
        //      FROM role_requests rr
        //      JOIN roles r ON rr.role_id = r.role_id
        //      WHERE rr.user_id = $1
        //      ORDER BY rr.requested_at DESC`,
        //     [userId]
        // );

        const roleRequestsResult = await pool.query(
            `SELECT rr.request_id,
                    rr.status,
                    rr.requested_at,
                    rr.remarks AS rejection_message,
                    r.role_name,
                    r.role_id
            FROM role_requests rr
            JOIN roles r ON rr.role_id = r.role_id
            WHERE rr.user_id = $1
            ORDER BY rr.requested_at DESC`,
            [userId]
        );

        res.json({
            ...user,
            roles: rolesResult.rows,
            articles: articlesResult.rows,
            role_requests: roleRequestsResult.rows,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/profile/me
// Update the current user's profile (name, department, phone)
router.put("/me", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, department, phone } = req.body;

        // Build a dynamic update — only update fields that were provided
        const fields = [];
        const values = [];
        let idx = 1;

        if (name !== undefined) {
            fields.push(`name = $${idx++}`);
            values.push(name.trim());
        }
        if (department !== undefined) {
            fields.push(`department = $${idx++}`);
            values.push(department.trim());
        }
        // if (phone !== undefined) {
        //     // Allow clearing the phone by sending an empty string
        //     fields.push(`phone = $${idx++}`);
        //     values.push(phone.trim() === "" ? null : phone.trim());
        // }
        if (phone !== undefined) {
            fields.push(`phone_number = $${idx++}`);
            values.push(phone.trim() === "" ? null : phone.trim());
        }
        if (fields.length === 0) {
            return res.status(400).json({ message: "No fields provided to update." });
        }

        values.push(userId);
        const result = await pool.query(
            `UPDATE users SET ${fields.join(", ")} WHERE user_id = $${idx} RETURNING user_id, name, email, department, phone_number AS phone`,
            values
        );

        await pool.query(
            `
            UPDATE key_contacts kc
            SET name = u.name,
                email = u.email,
                phone = u.phone_number,
                sap_module = u.department
            FROM users u
            WHERE kc.user_id = u.user_id
              AND u.user_id = $1
            `,
            [userId]
        );
        await pool.query(
            `
            INSERT INTO key_contacts (user_id, name, email, phone, sap_module)
            SELECT user_id, name, email, phone_number, department
            FROM users
            WHERE user_id = $1
              AND phone_number IS NOT NULL
              AND NOT EXISTS (
                  SELECT 1 FROM key_contacts WHERE user_id = $1
              )
            `,
            [userId]
        );

        res.json({ success: true, user: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
