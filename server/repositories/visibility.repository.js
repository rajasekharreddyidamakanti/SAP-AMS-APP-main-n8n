const pool = require("../config/db");

const updateVisibility = async (articleId, visibility) => {

    const result = await pool.query(
        `UPDATE knowledge_articles
         SET visibility=$1
         WHERE article_id=$2
         RETURNING *`,
        [visibility, articleId]
    );

    return result.rows[0];
};

const deleteRoles = async (articleId) => {

    await pool.query(
        `DELETE FROM article_visibility_roles
         WHERE article_id=$1`,
        [articleId]
    );
};

const addRole = async (articleId, roleId) => {

    await pool.query(
        `INSERT INTO article_visibility_roles
        (article_id,role_id)
        VALUES($1,$2)`,
        [articleId, roleId]
    );
};

const getVisibility = async (articleId) => {

    const article = await pool.query(

        `SELECT visibility
         FROM knowledge_articles
         WHERE article_id=$1`,

        [articleId]

    );

    const roles = await pool.query(

        `SELECT role_id
         FROM article_visibility_roles
         WHERE article_id=$1`,

        [articleId]

    );

    return {

        visibility: article.rows[0]?.visibility,

        roles: roles.rows

    };

};

module.exports = {

    updateVisibility,
    deleteRoles,
    addRole,
    getVisibility

};