const express=require("express");

const router=express.Router();

const authMiddleware=
require("../middleware/auth.middleware");

const aiReviewController=
require("../controllers/aiReview.controller");

router.get(

    "/:id",

    authMiddleware,

    aiReviewController.reviewArticle

);

module.exports=router;