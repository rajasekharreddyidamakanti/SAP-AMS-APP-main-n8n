const express = require("express");

const router = express.Router();

const authenticateUser =
require("../middleware/auth.middleware");

const controller =
require("../controllers/trainingModule.controller");

router.post(

    "/",

    authenticateUser,

    controller.createModule

);

router.get(

    "/",

    authenticateUser,

    controller.getAllModules

);

router.get(

    "/:id",

    authenticateUser,

    controller.getModuleById

);

router.put(

    "/:id",

    authenticateUser,

    controller.updateModule

);

router.delete(

    "/:id",

    authenticateUser,

    controller.deleteModule

);

module.exports = router;