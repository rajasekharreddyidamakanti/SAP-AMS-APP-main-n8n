const sectionService = require("../services/section.service");

const createSection = async (req, res) => {
    try {

        const section = await sectionService.createSection(req.body);

        res.status(201).json({
            message: "Section created successfully",
            section
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: error.message
        });

    }
};

const getSectionsByArticle = async (req, res) => {
    try {

        const sections = await sectionService.getSectionsByArticle(
            req.params.articleId
        );

        res.status(200).json(sections);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: error.message
        });

    }
};

const getSectionById = async (req, res) => {
    try {

        const section = await sectionService.getSectionById(req.params.id);

        if (!section) {
            return res.status(404).json({
                message: "Section not found"
            });
        }

        res.status(200).json(section);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: error.message
        });

    }
};

const updateSection = async (req, res) => {
    try {

        const section = await sectionService.updateSection(
            req.params.id,
            req.body
        );

        if (!section) {
            return res.status(404).json({
                message: "Section not found"
            });
        }

        res.status(200).json({
            message: "Section updated successfully",
            section
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: error.message
        });

    }
};

const deleteSection = async (req, res) => {
    try {

        const section = await sectionService.deleteSection(req.params.id);

        if (!section) {
            return res.status(404).json({
                message: "Section not found"
            });
        }

        res.status(200).json({
            message: "Section deleted successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: error.message
        });

    }
};

module.exports = {
    createSection,
    getSectionsByArticle,
    getSectionById,
    updateSection,
    deleteSection
};