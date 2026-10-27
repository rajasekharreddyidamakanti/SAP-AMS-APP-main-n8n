
const embeddingService = require("./embedding.service");
const similarityService = require("./similarity.service");

const aiSearchRepository =
    require("../repositories/aiSearch.repository");

const geminiProvider =
    require("../providers/gemini.provider");

const buildRagPrompt =
    require("../prompts/rag.prompt");

const VISIBILITY =require("../constants/visibility");
const MESSAGES =require("../constants/messages");

class AiSearchService {

    async search(query, userId) {

        // ----------------------------
        // Detect Intent
        // ----------------------------


        // ----------------------------
        // Generate Query Embedding
        // ----------------------------

        const queryEmbedding =
            await embeddingService.generateEmbedding(query);

        // ----------------------------
        // Fetch Published Articles
        // ----------------------------

        const articles =
            await aiSearchRepository.getPublishedArticles();

        // ----------------------------
        // Calculate Similarity
        // ----------------------------

        const rankedArticles = articles.map(article => {

            const embedding = Array.isArray(article.embedding)
                ? article.embedding
                : JSON.parse(article.embedding);

            const score =
                similarityService.cosineSimilarity(
                    queryEmbedding,
                    embedding
                );

            return {
                ...article,
                score
            };

        });

        // ----------------------------
        // Sort by similarity
        // ----------------------------

        rankedArticles.sort(
            (a, b) => b.score - a.score
        );

        // ----------------------------
        // Take Top 5
        // ----------------------------

        const topArticles =
            rankedArticles.slice(0, 5);

        // ----------------------------
        // Build RAG Prompt
        // ----------------------------

        const prompt =
            buildRagPrompt(
                query,
                topArticles
            );

        // ----------------------------
        // Gemini Response
        // ----------------------------

        const response =
            await geminiProvider.generate(prompt);
        
        console.log("========== GEMINI RESPONSE ==========");
        console.log(response);
        console.log("=====================================");

        let result;
        try {
            const cleaned = response
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            console.log("CLEANED RESPONSE:");
            console.log(cleaned);

            result = JSON.parse(cleaned);
        } catch (error) {
            console.error(error);

            throw {
                status: 500,
                message: "Invalid AI response."
            };
        }

        // ----------------------------
        // Attach source articles
        // ----------------------------

        result.sources = topArticles.map(article => ({
            article_id: article.article_id,
            title: article.title,
            similarity: Number(article.score.toFixed(4))
        }));

        

        // ----------------------------
        // If LLM requested an article
        // ----------------------------

        if (result.requestedArticleId) {

            const requestedArticle =
                topArticles.find(
                    article =>
                        article.article_id === Number(result.requestedArticleId)
                );

            if (requestedArticle) {

                if (requestedArticle.visibility === VISIBILITY.PUBLIC) {

                    result.article = requestedArticle;

                } else {

                    result.article = null;

                    result.message =MESSAGES.AI.ARTICLE_RESTRICTED;

                }

            }

        }

        return result;

    }

}

module.exports = new AiSearchService();