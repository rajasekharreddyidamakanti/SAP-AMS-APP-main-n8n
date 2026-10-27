const trainingModuleService =
require("../services/trainingModule.service");

const createModule = async (req, res) => {

    try {

        const module =
        await trainingModuleService.createModule(req.body);

        res.status(201).json({

            success: true,

            message: "Training module created successfully",

            data: module

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getAllModules = async (req, res) => {

    try {

        const modules =
        await trainingModuleService.getAllModules();

        res.json({

            success: true,

            data: modules

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const getModuleById = async (req, res) => {

    try {

        const module =
        await trainingModuleService.getModuleById(req.params.id);

        res.json({

            success: true,

            data: module

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const updateModule = async (req, res) => {

    try {

        const module =
        await trainingModuleService.updateModule(

            req.params.id,

            req.body

        );

        res.json({

            success: true,

            message: "Training module updated successfully",

            data: module

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

const deleteModule = async (req, res) => {

    try {

        await trainingModuleService.deleteModule(req.params.id);

        res.json({

            success: true,

            message: "Training module deleted successfully"

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

    createModule,

    getAllModules,

    getModuleById,

    updateModule,

    deleteModule

};