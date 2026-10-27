const readinessAssessmentService =
require("../services/readinessAssessment.service");

const createAssessment = async (req, res) => {

    try {

        const assessment =
        await readinessAssessmentService.createAssessment(req.body);

        res.status(201).json({

            success: true,

            message: "Readiness assessment created successfully",

            data: assessment

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getAllAssessments = async (req, res) => {

    try {

        const assessments =
        await readinessAssessmentService.getAllAssessments();

        res.json({

            success: true,

            data: assessments

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getAssessmentByMember = async (req, res) => {

    try {

        const assessment =
        await readinessAssessmentService.getAssessmentByMember(

            req.params.memberId

        );

        res.json({

            success: true,

            data: assessment

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const updateAssessment = async (req, res) => {

    try {

        const assessment =
        await readinessAssessmentService.updateAssessment(

            req.params.assessmentId,

            req.body

        );

        res.json({

            success: true,

            message: "Readiness assessment updated successfully",

            data: assessment

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

    createAssessment,

    getAllAssessments,

    getAssessmentByMember,

    updateAssessment

};