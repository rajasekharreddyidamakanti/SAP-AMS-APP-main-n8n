const checklistService =
require("../services/transitionChecklist.service");

const getChecklist = async (req, res) => {

    const data =
    await checklistService.getChecklist(

        req.params.transitionId

    );

    res.json({

        success: true,

        data

    });

};

const updateChecklist = async (req, res) => {

    const data =
    await checklistService.updateChecklist(

        req.params.checklistId,

        req.user.userId,

        req.body

    );

    res.json({

        success: true,

        data

    });

};

module.exports = {

    getChecklist,

    updateChecklist

};