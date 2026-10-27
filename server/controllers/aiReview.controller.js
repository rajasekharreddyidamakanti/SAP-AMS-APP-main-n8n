const aiReviewService =
require("../services/aiReview.service");

class AIReviewController{

    async reviewArticle(req,res){

        try{

            const result=

            await aiReviewService.reviewArticle(

                req.params.id

            );

            res.status(200).json({

                success:true,

                data:result

            });

        }

        catch(error){

            res.status(error.status||500).json({

                success:false,

                message:error.message

            });

        }

    }

}

module.exports=new AIReviewController();