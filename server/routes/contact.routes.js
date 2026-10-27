const express = require("express");

const router = express.Router();

const authenticateUser =
require("../middleware/auth.middleware");

const controller =
require("../controllers/contact.controller");

// ── Escalation paths (static routes first, so they
//    don't get swallowed by "/:id") ──────────────────

router.get(
    "/escalation",
    authenticateUser,
    controller.getAllEscalationPaths
);

router.post(
    "/escalation",
    authenticateUser,
    controller.setEscalationPath
);

router.get(
    "/escalation/:module",
    authenticateUser,
    controller.getEscalationPathByModule
);

// ── On-call roster ────────────────────────────────────

router.get(
    "/on-call",
    authenticateUser,
    controller.getOnCallContacts
);

// ── Core contact CRUD ─────────────────────────────────

router.post(
    "/",
    authenticateUser,
    controller.createContact
);

router.get(
    "/",
    authenticateUser,
    controller.getAllContacts
);

router.get(
    "/:id",
    authenticateUser,
    controller.getContactById
);

router.put(
    "/:id",
    authenticateUser,
    controller.updateContact
);

router.delete(
    "/:id",
    authenticateUser,
    controller.deleteContact
);

router.get(
    "/:id/history",
    authenticateUser,
    controller.getContactHistory
);

module.exports = router;