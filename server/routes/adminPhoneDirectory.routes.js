// server/routes/adminPhoneDirectory.routes.js
// const express = require("express");
// const router  = express.Router();
// const auth    = require("../middleware/auth.middleware");
// const pool    = require("../config/db");

// // GET /api/admin/phone-directory
// // Returns ALL registered users with their phone numbers (empty if not set)
// router.get("/", auth, async (req, res) => {
//     try {
//         const { rows } = await pool.query(
//             `SELECT u.user_id, u.name, u.email, u.department, u.phone,
//                     ARRAY_AGG(r.role_name) FILTER (WHERE r.role_name IS NOT NULL) AS roles
//              FROM users u
//              LEFT JOIN user_roles ur ON u.user_id = ur.user_id
//              LEFT JOIN roles r ON ur.role_id = r.role_id
//              GROUP BY u.user_id
//              ORDER BY u.name`
//         );
//         res.json({ success: true, data: rows });
//     } catch (err) {
//         res.status(500).json({ success: false, message: err.message });
//     }
// });

// module.exports = router;


//  change the context of the code to this for testing in the database

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const pool = require("../config/db");

// GET /api/admin/phone-directory
router.get("/", auth, async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT
                u.user_id,
                u.name,
                u.email,
                u.department,
                u.phone_number,
                ARRAY_AGG(r.role_name)
                    FILTER (WHERE r.role_name IS NOT NULL) AS roles
            FROM users u
            LEFT JOIN user_roles ur
                ON u.user_id = ur.user_id
            LEFT JOIN roles r
                ON ur.role_id = r.role_id
            GROUP BY
                u.user_id,
                u.name,
                u.email,
                u.department,
                u.phone_number
            ORDER BY u.name;
        `);

        res.json({
            success: true,
            data: rows
        });

    } catch (err) {
        console.error("Phone Directory Error:", err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

module.exports = router;