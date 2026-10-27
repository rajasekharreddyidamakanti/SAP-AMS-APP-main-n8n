const express = require("express");

const router = express.Router();

const authenticateUser =
require("../middleware/auth.middleware");

const controller =
require("../controllers/certification.controller");

router.post(
    "/",
    authenticateUser,
    controller.createCertification
);

router.get(
    "/",
    authenticateUser,
    controller.getAllCertifications
);

router.get(
    "/member/:memberId",
    authenticateUser,
    controller.getCertificationsByMember
);

router.put(
    "/:certificationId",
    authenticateUser,
    controller.updateCertification
);

router.delete(
    "/:certificationId",
    authenticateUser,
    controller.deleteCertification
);

module.exports = router;