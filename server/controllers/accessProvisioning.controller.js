const accessProvisioningService =
require("../services/accessProvisioning.service");

const createAccess = async (req, res) => {

    try {

        const access =
        await accessProvisioningService.createAccess(req.body);

        res.status(201).json({

            success: true,

            message: "Access request created successfully",

            data: access

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getMemberAccess = async (req, res) => {

    try {

        const access =
        await accessProvisioningService.getMemberAccess(

            req.params.memberId

        );

        res.json({

            success: true,

            data: access

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const updateAccess = async (req, res) => {

    try {

        const access =
        await accessProvisioningService.updateAccess(

            req.params.accessId,

            req.body

        );

        res.json({

            success: true,

            message: "Access request updated successfully",

            data: access

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

    createAccess,

    getMemberAccess,

    updateAccess

};