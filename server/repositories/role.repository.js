const pool = require("../config/db");

class RoleRepository {

    async requestRole(userId, roleId, deadline) {
        const result = await pool.query(
            `INSERT INTO role_requests
            (user_id, role_id, status, deadline)
            VALUES ($1,$2,'pending',$3)
            RETURNING *`,
            [userId, roleId, deadline]
        );

        return result.rows[0];
    }

    async getPendingRoles() {
        const result = await pool.query(
            `SELECT *
             FROM role_requests
             WHERE status='pending'
             ORDER BY requested_at ASC`
        );

        return result.rows;
    }

    async getRoleRequest(id) {
        const result = await pool.query(
            `SELECT *
             FROM role_requests
             WHERE request_id=$1`,
            [id]
        );

        return result.rows[0];
    }

    async addUserRole(userId, roleId) {
        await pool.query(
            `INSERT INTO user_roles(user_id,role_id)
             VALUES($1,$2)
             ON CONFLICT DO NOTHING`,
            [userId, roleId]
        );
    }

    async approveRole(id) {
        await pool.query(
            `UPDATE role_requests
             SET status='approved'
             WHERE request_id=$1`,
            [id]
        );
    }

    // async rejectRole(id, message) {
    //     await pool.query(
    //         `UPDATE role_requests
    //          SET status='rejected',
    //               remarks=$1             
    //                    #rejection_message=$1
    //          WHERE request_id=$2`,
    //         [message, id]
    //     );
    // }
    async rejectRole(id, message) {
        await pool.query(
            `UPDATE role_requests
             SET status='rejected',
                 remarks=$1
             WHERE request_id=$2`,
            [message, id]
        );
    }
    
    async getRoles() {
        const result = await pool.query(
            `SELECT role_id, role_name
             FROM roles
             ORDER BY role_name`
        );

        return result.rows;
    }

    async getPendingUsers() {
        const result = await pool.query(
            `SELECT
                user_id,
                name,
                email,
                department,
                approval_status,
                created_at
            FROM users
            WHERE is_approved=false
            AND approval_status='pending'
            ORDER BY created_at`
        );

        return result.rows;
    }

    async approveUser(id) {
        await pool.query(
            `UPDATE users
             SET is_approved=true,
                 approval_status='approved'
             WHERE user_id=$1`,
            [id]
        );
    }

    async getUser(id) {
        const result = await pool.query(
            `SELECT *
             FROM users
             WHERE user_id=$1`,
            [id]
        );

        return result.rows[0];
    }

    async saveRejectedRegistration(email, name, reason) {
        // The table `rejected_registrations` does not exist right now, 
        // so we skip saving this audit to prevent server crashes.
        // We just rely on deleting the user row instead.
        return true;
    }

    async deleteUser(id) {
        await pool.query(
            `DELETE FROM users
             WHERE user_id=$1`,
            [id]
        );
    }

    async getUsersWithRoles() {
        const result = await pool.query(
            `SELECT
                u.user_id,
                u.name,
                u.email,
                u.department,
                COALESCE(
                    JSON_AGG(
                        JSON_BUILD_OBJECT('role_id', r.role_id, 'role_name', r.role_name)
                    ) FILTER (WHERE r.role_id IS NOT NULL),
                    '[]'
                ) AS roles
             FROM users u
             LEFT JOIN user_roles ur ON u.user_id = ur.user_id
             LEFT JOIN roles r ON ur.role_id = r.role_id
             WHERE u.is_approved = true
             GROUP BY u.user_id, u.name, u.email, u.department
             ORDER BY u.name ASC`
        );
        return result.rows;
    }

    async assignRoleToUser(userId, roleId) {
        await pool.query(
            `INSERT INTO user_roles(user_id, role_id)
             VALUES($1, $2)
             ON CONFLICT DO NOTHING`,
            [userId, roleId]
        );
    }

    async removeRoleFromUser(userId, roleId) {
        await pool.query(
            `DELETE FROM user_roles
             WHERE user_id=$1 AND role_id=$2`,
            [userId, roleId]
        );
    }

    // async getPendingRolesWithDetails() {
    //     const result = await pool.query(
    //         `SELECT
    //             rr.request_id,
    //             rr.status,
    //             rr.requested_at,
    //             rr.deadline,
    //             rr.rejection_message,
    //             u.user_id,
    //             u.name AS user_name,
    //             u.email AS user_email,
    //             u.department,
    //             r.role_id,
    //             r.role_name
    //          FROM role_requests rr
    //          JOIN users u ON rr.user_id = u.user_id
    //          JOIN roles r ON rr.role_id = r.role_id
    //          WHERE rr.status = 'pending'
    //          ORDER BY rr.requested_at ASC`
    //     );
    //     return result.rows;
    // }
    // Changed for testing 
    async getPendingRolesWithDetails() {
        const result = await pool.query(
            `SELECT
                rr.request_id,
                rr.status,
                rr.requested_at,
                rr.deadline,
                rr.remarks,
                u.user_id,
                u.name AS user_name,
                u.email AS user_email,
                u.department,
                r.role_id,
                r.role_name
            FROM role_requests rr
            JOIN users u
                ON rr.user_id = u.user_id
            JOIN roles r
                ON rr.role_id = r.role_id
            WHERE rr.status = 'pending'
            ORDER BY rr.requested_at ASC`
        );

        return result.rows;
    }
    // 
}

module.exports = new RoleRepository();