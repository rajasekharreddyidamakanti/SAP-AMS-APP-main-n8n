const router=require("express").Router();

const auth=require("../middleware/auth.middleware");

const controller=
require("../controllers/duplicateDetection.controller");

router.get(
    "/:id",
    auth,
    controller.detectDuplicate
);

module.exports=router;