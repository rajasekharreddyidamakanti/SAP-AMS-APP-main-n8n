const pool = require("../config/db");

/**
 * Find user by email
 */
const findUserByEmail = async (email) => {
    const result = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
    );

    return result.rows[0] || null;
};

/**
 * Create new user
 */
const createUser = async ({ name, email, passwordHash, department }) => {
    const result = await pool.query(
        `INSERT INTO users
        (name, email, password_hash, department, is_approved, approval_status)
        VALUES
        ($1, $2, $3, $4, false, 'pending')
        RETURNING user_id, name, email, department`,
        [name, email, passwordHash, department]
    );

    return result.rows[0];
};

/**
 * Find rejected registration
 */
const findRejectedRegistration = async (email) => {
    const result = await pool.query(
        `SELECT id, reason
         FROM rejected_registrations
         WHERE email = $1
         ORDER BY rejected_at DESC
         LIMIT 1`,
        [email]
    );

    return result.rows[0] || null;
};

/**
 * Delete rejected registration
 */
const deleteRejectedRegistration = async (id) => {
    await pool.query(
        `DELETE FROM rejected_registrations
         WHERE id = $1`,
        [id]
    );
};

/**
 * Find rejected role request
 */
const findRejectedRole = async (userId) => {
    const result = await pool.query(
        `SELECT rejection_message
         FROM role_requests
         WHERE user_id = $1
         AND status='rejected'
         ORDER BY requested_at DESC
         LIMIT 1`,
        [userId]
    );

    return result.rows[0] || null;
};

/**
 * Get all roles of user
 */
const getUserRoles = async (userId) => {
    const result = await pool.query(
        `SELECT r.role_name
         FROM user_roles ur
         JOIN roles r
         ON ur.role_id = r.role_id
         WHERE ur.user_id = $1`,
        [userId]
    );

    return result.rows.map(role => role.role_name);
};

/**
 * Get user by ID
 */
const getUserById = async (userId) => {
    const result = await pool.query(
        `SELECT user_id, name, email, department
         FROM users
         WHERE user_id = $1`,
        [userId]
    );

    return result.rows[0] || null;
};
/**
 * Get expert contact details
 */
const getContactDetails = async (userId) => {

    const result = await pool.query(
        `
        SELECT
            user_id,
            name,
            email,
            department
        FROM users
        WHERE user_id = $1
        `,
        [userId]
    );

    return result.rows[0] || null;
};

/**
 * Get another expert
 */
/**
 * Get another expert with the same expertise tag
 */
const getAnotherExpert = async (currentExpertId, module) => {

    const result = await pool.query(
        `
        SELECT DISTINCT
            u.user_id,
            u.name,
            u.email
        FROM users u
        JOIN user_tags ut
            ON u.user_id = ut.user_id
        JOIN expertise_tags et
            ON ut.tag_id = et.tag_id
        WHERE
            LOWER(et.tag_name) = LOWER($2)
            AND u.user_id <> $1
        LIMIT 1
        `,
        [currentExpertId, module]
    );

    return result.rows[0] || null;
};


/**
 * Get another expert with same expertise
 */
const getAlternateExpert = async (currentExpertId, module) => {

    const result = await pool.query(
        `
        SELECT DISTINCT
            u.user_id,
            u.name
        FROM users u
        JOIN user_tags ut
            ON u.user_id = ut.user_id
        JOIN expertise_tags et
            ON ut.tag_id = et.tag_id
        WHERE
            et.tag_name = $1
            AND u.user_id <> $2
        LIMIT 1
        `,
        [module, currentExpertId]
    );

    return result.rows[0] || null;
};

/**
 * Update profile
 */
const updateProfile = async (userId, data) => {

    const result = await pool.query(
        `
        UPDATE users
        SET
            phone = COALESCE($2, phone),
            designation = COALESCE($3, designation)
        WHERE user_id=$1
        RETURNING user_id,name,email,department,phone,designation
        `,
        [
            userId,
            data.phone,
            data.designation
        ]
    );

    return result.rows[0];
};
/**
 * Get all approved users (for co-author selection, admin user lists, etc.)
 * 

//   ADDED FOR TESTING THE THE PROJECT
 */
const getAllUsers = async () => {
    const result = await pool.query(
        `SELECT user_id, name, email, department
         FROM users
         WHERE is_approved = true
         ORDER BY name`
    );

    return result.rows;
};

// TILL HERE
const getKeyContactRegistry = async () => {

    const result = await pool.query(
        `
        SELECT

            u.user_id,
            u.name,
            u.email,
            u.department,
            u.phone,
            u.designation,

            COALESCE(
                STRING_AGG(DISTINCT r.role_name, ', '),
                ''
            ) AS roles,

            COALESCE(
                STRING_AGG(DISTINCT et.tag_name, ', '),
                ''
            ) AS expertise_tags,

            COUNT(DISTINCT a.article_id)
                FILTER
                (
                    WHERE a.status='approved'
                ) AS approved_articles

        FROM users u

        LEFT JOIN user_roles ur
            ON u.user_id=ur.user_id

        LEFT JOIN roles r
            ON ur.role_id=r.role_id

        LEFT JOIN user_tags ut
            ON u.user_id=ut.user_id

        LEFT JOIN expertise_tags et
            ON ut.tag_id=et.tag_id

        LEFT JOIN knowledge_articles a
            ON u.user_id = a.created_by

        WHERE u.is_approved=true

        GROUP BY

            u.user_id,
            u.name,
            u.email,
            u.department,
            u.phone,
            u.designation

        ORDER BY u.name;
        `
    );

    return result.rows;

};

module.exports = {
    findUserByEmail,
    createUser,
    findRejectedRegistration,
    deleteRejectedRegistration,
    findRejectedRole,
    getUserRoles,
    getUserById,
    getContactDetails,
    getAnotherExpert,
    getAlternateExpert,
    updateProfile,
    getAllUsers,
    getKeyContactRegistry
    
};