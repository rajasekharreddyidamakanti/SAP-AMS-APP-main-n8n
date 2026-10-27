const onboardingService =
require("../services/onboarding.service");

const createMember = async (req, res) => {

    try {

        const member =
        await onboardingService.createMember(

            req.body,

            req.user.userId

        );

        res.status(201).json({

            success: true,

            message: "Onboarding member created successfully",

            data: member

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getAllMembers = async (req, res) => {

    try {

        const members =
        await onboardingService.getAllMembers();

        res.json({

            success: true,

            data: members

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getMemberById = async (req, res) => {

    try {

        const member =
        await onboardingService.getMemberById(

            req.params.id

        );

        res.json({

            success: true,

            data: member

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const updateMember = async (req, res) => {

    try {

        const member =
        await onboardingService.updateMember(

            req.params.id,

            req.body

        );

        res.json({

            success: true,

            message: "Onboarding updated successfully",

            data: member

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

    createMember,

    getAllMembers,

    getMemberById,

    updateMember

};