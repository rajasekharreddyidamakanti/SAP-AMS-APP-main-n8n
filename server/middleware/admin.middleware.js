const articleRepository = require("../repositories/article.repository");

const requireAdmin = async (req, res, next) => {
    try {
        const roles = await articleRepository.getAuthorRoles(req.user.userId);
        const isAdmin = roles.some(
            (role) => String(role).toLowerCase() === "admin"
        );

        if (!isAdmin) {
            return res.status(403).json({
                message: "Only an admin can perform this action."
            });
        }

        return next();
    } catch (error) {
        return next(error);
    }
};

module.exports = requireAdmin;
