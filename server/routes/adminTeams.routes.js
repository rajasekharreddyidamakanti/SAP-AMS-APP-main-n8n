// server/routes/adminTeams.routes.js
const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth.middleware");
const pool    = require("../config/db");

// GET /api/admin/teams
// Returns all users who have L1 Support or L2 Support roles
router.get("/", auth, async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT u.user_id, u.name, u.email, u.department, u.phone_number,
                    r.role_name AS role
             FROM users u
             JOIN user_roles ur ON u.user_id = ur.user_id
             JOIN roles r ON ur.role_id = r.role_id
             WHERE r.role_name IN ('L1 Support', 'L2 Support')
               AND u.is_active = true
             ORDER BY r.role_name, u.name`
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
