const express = require("express");

const router = express.Router();

const authenticateUser =
require("../middleware/auth.middleware");

const controller =
require("../controllers/accessProvisioning.controller");

router.post(

    "/",

    authenticateUser,

    controller.createAccess

);

router.get(

    "/member/:memberId",

    authenticateUser,

    controller.getMemberAccess

);

router.put(

    "/:accessId",

    authenticateUser,

    controller.updateAccess

);

module.exports = router;