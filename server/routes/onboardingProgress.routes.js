const express = require("express");

const router = express.Router();

const authenticateUser =
require("../middleware/auth.middleware");

const onboardingProgressController =
require("../controllers/onboardingProgress.controller");

router.put(

    "/:memberId",

    authenticateUser,

    onboardingProgressController.updateOverallStatus

);

module.exports = router;