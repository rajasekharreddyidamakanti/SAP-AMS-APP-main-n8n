const embeddingProvider =
require("../providers/embedding.provider");

const vectorRepository =
require("../repositories/vector.repository");

class EmbeddingService {

    // Generate embedding from any text
    async generateEmbedding(text) {

        return await embeddingProvider.createEmbedding(text);

    }

    // Generate embedding for a complete article
    async generateArticleEmbedding(article) {

        const text = `
Title:
${article.title}

Summary:
${article.summary}

Module:
${article.module}

Content:
${article.content}

Severity:
${article.severity}

Department:
${article.department}

Tags:
${Array.isArray(article.tags)
    ? article.tags.join(", ")
    : article.tags || ""}
`;

        const embedding =
            await this.generateEmbedding(text);

        await vectorRepository.saveEmbedding(
            article.article_id,
            embedding
        );

        return embedding;

    }

}

module.exports = new EmbeddingService();