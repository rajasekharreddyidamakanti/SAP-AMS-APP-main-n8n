const express = require("express");

const router = express.Router();

const authenticateUser =
require("../middleware/auth.middleware");

const onboardingApprovalController =
require("../controllers/onboardingApproval.controller");

router.post(

    "/:memberId",

    authenticateUser,

    onboardingApprovalController.approveMember

);

module.exports = router;