const onboardingDashboardService =
require("../services/onboardingDashboard.service");

const getDashboard = async (req, res) => {

    try {

        const dashboard =
        await onboardingDashboardService.getDashboard();

        res.status(200).json({

            success: true,

            data: dashboard

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

    getDashboard

};