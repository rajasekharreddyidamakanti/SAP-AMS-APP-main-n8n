const express = require("express");

const router = express.Router();

const authenticateUser =
require("../middleware/auth.middleware");

const controller =
require("../controllers/shadowAssignment.controller");

router.post(

    "/",

    authenticateUser,

    controller.createShadow

);

router.get(

    "/",

    authenticateUser,

    controller.getAllShadows

);

router.get(

    "/:memberId",

    authenticateUser,

    controller.getShadowByMember

);

router.put(

    "/:shadowId",

    authenticateUser,

    controller.updateShadow

);

module.exports = router;