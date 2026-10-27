const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const validate = require("../middleware/validate.middleware");

const {

    visibilityValidator

} = require("../validators");

const {

    setVisibility,
    getVisibility

} = require("../controllers/visibility.controller");

router.put(

    "/article/:articleId",

    authMiddleware,

    visibilityValidator,

    validate,

    setVisibility

);

router.get(

    "/article/:articleId",

    authMiddleware,

    getVisibility

);

module.exports = router;