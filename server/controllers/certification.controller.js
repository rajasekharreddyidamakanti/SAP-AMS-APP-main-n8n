const certificationService =
require("../services/certification.service");

const createCertification = async (req, res) => {

    try {

        const certification =
        await certificationService.createCertification(req.body);

        res.status(201).json({

            success: true,

            message: "Certification created successfully",

            data: certification

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getAllCertifications = async (req, res) => {

    try {

        const certifications =
        await certificationService.getAllCertifications();

        res.json({

            success: true,

            data: certifications

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getCertificationsByMember = async (req, res) => {

    try {

        const certifications =
        await certificationService.getCertificationsByMember(

            req.params.memberId

        );

        res.json({

            success: true,

            data: certifications

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const updateCertification = async (req, res) => {

    try {

        const certification =
        await certificationService.updateCertification(

            req.params.certificationId,

            req.body

        );

        res.json({

            success: true,

            message: "Certification updated successfully",

            data: certification

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const deleteCertification = async (req, res) => {

    try {

        await certificationService.deleteCertification(

            req.params.certificationId

        );

        res.json({

            success: true,

            message: "Certification deleted successfully"

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

    createCertification,

    getAllCertifications,

    getCertificationsByMember,

    updateCertification,

    deleteCertification

};