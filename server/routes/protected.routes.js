const express = require("express");
const router = express.Router();

const authenticateUser = require("../middleware/auth.middleware");

router.get("/", authenticateUser, (req, res) => {
    res.json({
        message: "Protected route accessed successfully",
        user: req.user
    });
});

module.exports = router;