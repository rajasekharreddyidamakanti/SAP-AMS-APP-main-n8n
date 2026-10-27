const express = require("express");

const router = express.Router();

const authenticateUser =
require("../middleware/auth.middleware");

const controller =
require("../controllers/readinessAssessment.controller");

router.post(

    "/",

    authenticateUser,

    controller.createAssessment

);

router.get(

    "/",

    authenticateUser,

    controller.getAllAssessments

);

router.get(

    "/:memberId",

    authenticateUser,

    controller.getAssessmentByMember

);

router.put(

    "/:assessmentId",

    authenticateUser,

    controller.updateAssessment

);

module.exports = router;