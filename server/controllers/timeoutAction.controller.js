const timeoutActionService =
    require("../services/timeoutAction.service");

const timeoutAction = async (req,res)=>{

    try{

        const result =
            await timeoutActionService.process(

                req.params.requestId,

                req.body.action

            );

        res.json(result);

    }

    catch(error){

        res.status(error.status||500).json({

            message:error.message

        });

    }

};

module.exports={

    timeoutAction

};