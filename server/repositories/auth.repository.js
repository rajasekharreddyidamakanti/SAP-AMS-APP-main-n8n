const pool = require("../config/db");

const findUserByEmail = async (email) => {
    const result = await pool.query(
        `
        SELECT *
        FROM users
        WHERE email = $1
        `,
        [email]
    );

    return result.rows[0];
};

const createUser = async ({
    name,
    email,
    passwordHash,
    department,
    phone_number
}) => {
    const result = await pool.query(
        `
        INSERT INTO users
        (
            name,
            email,
            password_hash,
            department,
            phone_number
        )
        VALUES ($1,$2,$3,$4,$5)
        RETURNING *
        `,
        [
            name,
            email,
            passwordHash,
            department,
            phone_number || null
        ]
    );

    return result.rows[0];
};

const assignRole = async (userId, roleId) => {
    await pool.query(
        `
        INSERT INTO user_roles(user_id, role_id)
        VALUES ($1,$2)
        ON CONFLICT DO NOTHING
        `,
        [userId, roleId]
    );
};

const getUserRoles = async (userId) => {
    const result = await pool.query(
        `
        SELECT r.role_name
        FROM user_roles ur
        JOIN roles r
        ON ur.role_id = r.role_id
        WHERE ur.user_id = $1
        `,
        [userId]
    );

    // Return plain strings e.g. ["Admin", "Expert"]
    return result.rows.map((r) => r.role_name);
};

// ----------------------------
// Rejected Registration
// ----------------------------

const findRejectedRegistration = async (email) => {
    const result = await pool.query(
        `
        SELECT *
        FROM rejected_registrations
        WHERE email = $1
        `,
        [email]
    );

    return result.rows[0];
};

const deleteRejectedRegistration = async (id) => {
    await pool.query(
        `
        DELETE FROM rejected_registrations
        WHERE id = $1
        `,
        [id]
    );
};

// ----------------------------
// Rejected Role Request
// ----------------------------

const findRejectedRole = async (userId) => {
    const result = await pool.query(
        `
        SELECT rejection_message
        FROM role_requests
        WHERE user_id = $1
          AND status='rejected'
        ORDER BY request_id DESC
        LIMIT 1
        `,
        [userId]
    );

    return result.rows[0];
};

module.exports = {
    findUserByEmail,
    createUser,
    assignRole,
    getUserRoles,
    findRejectedRegistration,
    deleteRejectedRegistration,
    findRejectedRole
};