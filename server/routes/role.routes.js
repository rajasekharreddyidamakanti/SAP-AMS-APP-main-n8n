const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");

const {
    roleValidator
} = require("../validators");

const {
    requestRole,
    getPendingRoles,
    approveRole,
    rejectRole,
    getRoles,
    getPendingUsers,
    approveUser,
    rejectUser,
    getUsersWithRoles,
    assignRoleToUser,
    removeRoleFromUser,
    getPendingRolesWithDetails,
} = require("../controllers/role.controller");

// Roles
router.get("/", getRoles);

router.post(
    "/request",
    authMiddleware,
    roleValidator,
    validate,
    requestRole
);

router.get("/pending", getPendingRoles);

router.put("/approve/:id", approveRole);

router.put("/reject/:id", rejectRole);

// Admin: Users with roles management
router.get("/admin/users", getUsersWithRoles);

router.post("/admin/users/:userId/assign", assignRoleToUser);

router.delete("/admin/users/:userId/roles/:roleId", removeRoleFromUser);

// Admin: Pending role requests with full details
router.get("/admin/pending", getPendingRolesWithDetails);

// User registration approvals
router.get("/users/pending", getPendingUsers);

router.put("/users/approve/:id", approveUser);

router.put("/users/reject/:id", rejectUser);

module.exports = router;