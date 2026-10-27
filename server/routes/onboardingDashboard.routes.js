const express = require("express");

const router = express.Router();

const authenticateUser =
require("../middleware/auth.middleware");

const onboardingDashboardController =
require("../controllers/onboardingDashboard.controller");

router.get(

    "/dashboard",

    authenticateUser,

    onboardingDashboardController.getDashboard

);

module.exports = router;