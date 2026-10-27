const articleRepository = require("../repositories/article.repository");
const visibilityRepository = require("../repositories/visibility.repository");
const embeddingService = require("./embedding.service");
const VISIBILITY = require("../constants/visibility");
// 
const logger = require("../utils/logger");
// 
class ArticleService {

    async createArticle(data, userId) {

        data.visibility = data.visibility?.toLowerCase();

        const article = await articleRepository.createArticle({
            ...data,
            createdBy: userId,
            status: data.status || "under_review"
        });

        if (
            data.visibility === VISIBILITY.RESTRICTED &&
            data.roles?.length
        ) {
            for (const roleId of data.roles) {
                await visibilityRepository.addRole(
                    article.article_id,
                    roleId
                );
            }
        }

        if (data.co_author_id) {
            const notificationService = require("./notification.service");
            await notificationService.createNotification({
                userId: data.co_author_id,
                title: "Co-Author Request",
                message: `You have been added as a co-author for the article "${data.title}". Please review and approve it.`,
                type: "system",
                link: `/articles/${article.article_id}`
            });
        }

        return article;
    }

    async getAllArticles(userId) {

        return await articleRepository.getAllArticles(userId);

    }

    async getPendingArticles() {

        return await articleRepository.getPendingArticles();

    }

    async getArticleById(id) {

        const article =
            await articleRepository.getArticleById(id);

        if (!article) {

            throw {
                status: 404,
                message: "Article not found"
            };

        }

        const attachments =
            await articleRepository.getAttachments(id);

        return {
            article,
            attachments
        };

    }

    async updateArticle(id, data, user) {

        const article =
            await articleRepository.getArticleOwner(id);

        if (!article) {

            throw {
                status: 404,
                message: "Article not found"
            };

        }

        const isOwner =
            article.created_by === user.userId;

        const userRoles = [
            ...(Array.isArray(user.roles) ? user.roles : []),
            user.role
        ].filter(Boolean);
        const databaseRoles = await articleRepository.getAuthorRoles(user.userId);
        const isAdmin =
            [...userRoles, ...databaseRoles].some(
                (role) => String(role).toLowerCase() === "admin"
            );

        if (!isOwner && !isAdmin) {

            throw {
                status: 403,
                message: "You are not allowed to edit this article."
            };

        }

        const updated =
            await articleRepository.updateArticle(
                id,
                data
            );

        // Update visibility mapping
        if (data.visibility) {

            await visibilityRepository.deleteRoles(id);

            if (
                data.visibility === "restricted" &&
                data.roles &&
                data.roles.length > 0
            ) {

                for (const roleId of data.roles) {

                    await visibilityRepository.addRole(
                        id,
                        roleId
                    );

                }

            }

        }

        // Save edit history (if implemented)
        if (articleRepository.saveEditHistory) {

            await articleRepository.saveEditHistory(
                id,
                user.userId,
                data
            );

        }

        return updated;

    }

    async coAuthorApproveArticle(id, userId) {
        const article = await articleRepository.coAuthorApproveArticle(id, userId);
        if (!article) {
            throw {
                status: 404,
                message: "Article not found or you are not the co-author"
            };
        }
        return article;
    }

    async approveArticle(id, user) {
        await this.assertAdmin(user);

        const articleAuthor =
            await articleRepository.getArticleAuthor(id);

        if (!articleAuthor) {
            throw {
                status: 404,
                message: "Article not found"
            };
        }

    // -----------------------------
    // Get author department & roles
    // -----------------------------

        const department =
            await articleRepository.getAuthorDepartment(
                articleAuthor.created_by
            );

        const roles =
            await articleRepository.getAuthorRoles(
                articleAuthor.created_by
            );

        const autoTags = [
            department,
            ...roles
        ].filter(Boolean);

    // -----------------------------
    // Publish article
    // -----------------------------

        const approvedArticle =
            await articleRepository.approveArticle(
                id,
                autoTags
            );

    // -----------------------------
    // Fetch complete article
    // -----------------------------

    //     

    // -----------------------------
    // Build text for embedding
    // -----------------------------

         // -----------------------------
    // Generate embedding (best-effort — a failure here, e.g. a missing or
    // invalid GEMINI_API_KEY, must NOT block the approval itself, since the
    // article is already published in the database above by this point)
    // -----------------------------

        try {

            const article =
                await articleRepository.getArticleForEmbedding(id);

            const embeddingText = [
                article.title,
                article.summary,
                article.content,
                article.module,
                article.department,
                article.severity,
                ...(article.tags || [])
            ].join("\n");

            const embedding =
                await embeddingService.generateEmbedding(
                    embeddingText
                );

            await articleRepository.updateEmbedding(
                id,
                embedding
            );

        } catch (embeddingError) {

            logger.error(
                `Failed to generate/save embedding for article ${id}: ${embeddingError.message}`
            );

        }

        return approvedArticle;
    }

    // 

    async rejectArticle(id, reason, user) {
        await this.assertAdmin(user);

        if (!reason) {

            throw {
                status: 400,
                message: "Rejection reason is required"
            };

        }

        const article =
            await articleRepository.rejectArticle(
                id,
                reason
            );

        if (!article) {

            throw {
                status: 404,
                message: "Article not found"
            };

        }

        return article;

    }

    async assertAdmin(user) {
        const tokenRoles = [
            ...(Array.isArray(user?.roles) ? user.roles : []),
            user?.role
        ].filter(Boolean);
        const databaseRoles = user?.userId
            ? await articleRepository.getAuthorRoles(user.userId)
            : [];
        const isAdmin = [...tokenRoles, ...databaseRoles].some(
            (role) => String(role).toLowerCase() === "admin"
        );

        if (!isAdmin) {
            throw {
                status: 403,
                message: "Only an admin can perform this action."
            };
        }
    }

    async searchArticles(keyword, userId) {

        return await articleRepository.searchArticles(
            keyword,
            userId
        );

    }

    async getArticleExperts(articleId) {
        return await articleRepository.getArticleExperts(articleId);
    }

    async deleteArticle(id) {

        const article =
            await articleRepository.deleteArticle(id);

        if (!article) {

            throw {
                status: 404,
                message: "Article not found"
            };

        }

        return article;

    }

    async getEditHistory(articleId) {

        return await articleRepository.getEditHistory(
            articleId
        );

    }

}

module.exports = new ArticleService();