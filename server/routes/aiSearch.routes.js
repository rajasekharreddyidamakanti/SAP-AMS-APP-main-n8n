const router = require("express").Router();

const auth =
    require("../middleware/auth.middleware");

const controller =
    require("../controllers/aiSearch.controller");

router.post(
    "/",
    auth,
    controller.search
);

module.exports = router;