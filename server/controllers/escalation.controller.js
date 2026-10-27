const escalationService =
    require("../services/escalation.service");

const transferRequest = async (req,res)=>{

    try{

        const request =
            await escalationService.transferRequest(
                req.params.requestId
            );

        res.json({

            message:"Request transferred successfully",

            request

        });

    }

    catch(error){

        res.status(error.status || 500).json({

            message:error.message

        });

    }

};

module.exports = {

    transferRequest

};