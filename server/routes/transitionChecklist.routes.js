const express = require("express");

const router = express.Router();

const authenticateUser =
require("../middleware/auth.middleware");

const controller =
require("../controllers/transitionChecklist.controller");

router.get(

    "/:transitionId",

    authenticateUser,

    controller.getChecklist

);

router.put(

    "/:checklistId",

    authenticateUser,

    controller.updateChecklist

);

module.exports = router;