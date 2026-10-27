const repository = require("../repositories/visibility.repository");

const setVisibility = async (articleId, visibility, roles = []) => {

    const article = await repository.updateVisibility(
        articleId,
        visibility
    );

    await repository.deleteRoles(articleId);

    if (visibility === "restricted") {

        for (const roleId of roles) {

            await repository.addRole(articleId, roleId);

        }

    }

    return article;
};

const getVisibility = async (articleId) => {

    return await repository.getVisibility(articleId);

};

module.exports = {

    setVisibility,
    getVisibility

};