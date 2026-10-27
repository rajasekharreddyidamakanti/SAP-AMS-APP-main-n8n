const duplicateService =
require("../services/duplicateDetection.service");

const detectDuplicate = async(req,res)=>{

    try{

        const result=
        await duplicateService.detect(
            req.params.id
        );

        res.json(result);

    }

    catch(err){

        res.status(err.status||500).json({

            message:err.message

        });

    }

};

module.exports={
    detectDuplicate
};