const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/auth.middleware");

const {
    getStats
} = require("../controllers/dashboard.controller");

router.get(
    "/stats",
    authMiddleware,
    getStats
);

module.exports = router;