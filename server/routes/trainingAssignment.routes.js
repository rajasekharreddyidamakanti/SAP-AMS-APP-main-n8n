const express = require("express");

const router = express.Router();

const authenticateUser =
require("../middleware/auth.middleware");

const controller =
require("../controllers/trainingAssignment.controller");

router.post(

    "/",

    authenticateUser,

    controller.assignModule

);

router.get(

    "/member/:memberId",

    authenticateUser,

    controller.getAssignments

);

router.put(

    "/:assignmentId",

    authenticateUser,

    controller.updateAssignment

);

module.exports = router;