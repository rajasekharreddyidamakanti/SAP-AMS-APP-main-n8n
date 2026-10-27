const onboardingProgressService =
require("../services/onboardingProgress.service");

const updateOverallStatus = async (req, res) => {

    try {

        const member =
        await onboardingProgressService.updateOverallStatus(

            req.params.memberId

        );

        res.status(200).json({

            success: true,

            message: "Overall onboarding status updated successfully.",

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

    updateOverallStatus

};