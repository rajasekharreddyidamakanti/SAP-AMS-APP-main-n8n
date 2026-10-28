const articleService = require("../services/article.service");

const createArticle = async (req, res) => {
    try {

        const article = await articleService.createArticle(
            req.body,
            req.user.userId
        );

        res.status(201).json({
            message: "Article created successfully",
            article
        });

    } catch (error) {

        res.status(error.status || 500).json({
            message: error.message
        });

    }
};

const getAllArticles = async (req, res) => {
    try {

        const articles = await articleService.getAllArticles(
            req.user?.userId
        );

        res.json(articles);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const getPendingArticles = async (req, res) => {
    try {

        const articles =
            await articleService.getPendingArticles();

        res.json(articles);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const getArticleById = async (req, res) => {
    try {

        const article =
            await articleService.getArticleById(
                req.params.id,
                req.user.userId
            );

        res.json(article);

    } catch (error) {

        res.status(error.status || 500).json({
            message: error.message
        });

    }
};

const updateArticle = async (req, res) => {
    try {
        const article =
            await articleService.updateArticle(
                req.params.id,
                req.body,
                req.user
            );

        res.json({
            message: "Article updated successfully",
            article
        });

    } catch (error) {

        res.status(error.status || 500).json({
            message: error.message
        });

    }
};

const approveArticle = async (req, res) => {
    try {

        const article =
            await articleService.approveArticle(
                req.params.id,
                req.user
            );

        res.json({
            message: "Article approved",
            article
        });

    } catch (error) {

        res.status(error.status || 500).json({
            message: error.message
        });

    }
};

const rejectArticle = async (req, res) => {
    try {

        const article =
            await articleService.rejectArticle(
                req.params.id,
                req.body.reason,
                req.user
            );

        res.json({
            message: "Article rejected",
            article
        });

    } catch (error) {

        res.status(error.status || 500).json({
            message: error.message
        });

    }
};

const coAuthorApproveArticle = async (req, res) => {
    try {
        const article = await articleService.coAuthorApproveArticle(
            req.params.id,
            req.user.userId
        );
        res.json({
            message: "Co-author approval successful",
            article
        });
    } catch (error) {
        res.status(error.status || 500).json({
            message: error.message
        });
    }
};

const searchArticles = async (req, res) => {
    try {

        const articles =
        await articleService.searchArticles(
            req.query.keyword,
            req.user.userId
        );

        res.json(articles);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const getArticleExperts = async (req, res) => {
    try {
        const experts = await articleService.getArticleExperts(
            req.params.id,
            req.user.userId
        );
        res.json({ success: true, data: experts });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

const deleteArticle = async (req, res) => {
    try {

        await articleService.deleteArticle(
            req.params.id,
            req.user
        );

        res.json({
            message: "Article deleted successfully"
        });

    } catch (error) {

        res.status(error.status || 500).json({
            message: error.message
        });

    }
};

const getEditHistory = async(req,res)=>{

    try{

        const history =
            await articleService.getEditHistory(
                req.params.id,
                req.user
            );

        res.json(history);

    }
    catch(error){

        res.status(error.status || 500).json({
            message:error.message
        });

    }

};

module.exports = {
    createArticle,
    getAllArticles,
    getPendingArticles,
    getArticleById,
    updateArticle,
    approveArticle,
    coAuthorApproveArticle,
    rejectArticle,
    searchArticles,
    deleteArticle,
    getEditHistory,
    getArticleExperts
};