const trainingAssignmentService =
require("../services/trainingAssignment.service");

const assignModule = async (req, res) => {

    try {

        const assignment =
        await trainingAssignmentService.assignModule(req.body);

        res.status(201).json({

            success: true,

            message: "Training assigned successfully",

            data: assignment

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getAssignments = async (req, res) => {

    try {

        const assignments =
        await trainingAssignmentService.getAssignments(

            req.params.memberId

        );

        res.json({

            success: true,

            data: assignments

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const updateAssignment = async (req, res) => {

    try {

        const assignment =
        await trainingAssignmentService.updateAssignment(

            req.params.assignmentId,

            req.body

        );

        res.json({

            success: true,

            message: "Training assignment updated",

            data: assignment

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

    assignModule,

    getAssignments,

    updateAssignment

};