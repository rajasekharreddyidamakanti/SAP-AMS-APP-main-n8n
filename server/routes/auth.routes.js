const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");

const {
    registerUser,
    loginUser,
    updateProfile,
    getKeyContactRegistry
} = require("../controllers/auth.controller");


const {
    registerValidation,
    loginValidation
} = require("../validators");

const validate = require("../middleware/validate.middleware");

router.post(
    "/register",
    registerValidation,
    validate,
    registerUser
);

router.post(
    "/login",
    loginValidation,
    validate,
    loginUser
);
router.put(

    "/profile",

    authMiddleware,

    updateProfile

);
router.get(

    "/registry",

    authMiddleware,

    getKeyContactRegistry

);

module.exports = router;