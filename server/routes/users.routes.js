const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const userService = require("../services/user.service");

// GET /api/users
// Returns all approved users (id, name, email, department) — used for
// co-author selection on article creation, admin user lists, etc.
router.get("/", authMiddleware, async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;