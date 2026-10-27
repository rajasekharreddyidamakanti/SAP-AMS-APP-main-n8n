const onboardingApprovalService =
require("../services/onboardingApproval.service");

const approveMember = async (req, res) => {

    try {

        const member =
        await onboardingApprovalService.approveMember(

            req.params.memberId

        );

        if (!member) {

            return res.status(400).json({

                success: false,

                message: "Member cannot be approved. Complete all onboarding requirements first."

            });

        }

        res.status(200).json({

            success: true,

            message: "Member approved successfully.",

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

    approveMember

};