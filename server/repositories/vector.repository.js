const pool = require("../config/db");

class VectorRepository {

    async saveEmbedding(articleId, embedding) {

        await pool.query(

            `
            UPDATE knowledge_articles
            SET embedding = $1
            WHERE article_id = $2
            `,

            [
                JSON.stringify(embedding),
                articleId
            ]

        );

    }

}

module.exports = new VectorRepository();