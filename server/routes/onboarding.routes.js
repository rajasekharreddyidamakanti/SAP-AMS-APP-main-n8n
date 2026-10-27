const express = require("express");

const router = express.Router();

const authenticateUser =
require("../middleware/auth.middleware");

const onboardingController =
require("../controllers/onboarding.controller");

router.post(

    "/",

    authenticateUser,

    onboardingController.createMember

);

router.get(

    "/",

    authenticateUser,

    onboardingController.getAllMembers

);

router.get(

    "/:id",

    authenticateUser,

    onboardingController.getMemberById

);

router.put(

    "/:id",

    authenticateUser,

    onboardingController.updateMember

);

module.exports = router;