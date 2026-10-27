const shadowAssignmentService =
require("../services/shadowAssignment.service");

const createShadow = async (req, res) => {

    try {

        const shadow =
        await shadowAssignmentService.createShadow(req.body);

        res.status(201).json({

            success: true,

            message: "Shadow assignment created successfully",

            data: shadow

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getAllShadows = async (req, res) => {

    try {

        const shadows =
        await shadowAssignmentService.getAllShadows();

        res.json({

            success: true,

            data: shadows

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getShadowByMember = async (req, res) => {

    try {

        const shadow =
        await shadowAssignmentService.getShadowByMember(

            req.params.memberId

        );

        res.json({

            success: true,

            data: shadow

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const updateShadow = async (req, res) => {

    try {

        const shadow =
        await shadowAssignmentService.updateShadow(

            req.params.shadowId,

            req.body

        );

        res.json({

            success: true,

            message: "Shadow assignment updated successfully",

            data: shadow

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

module.exports = {

    createShadow,

    getAllShadows,

    getShadowByMember,

    updateShadow

};