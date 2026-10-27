const articleRepository = require("../repositories/article.repository");
const duplicateRepository = require("../repositories/duplicateDetection.repository");

const geminiProvider = require("../providers/gemini.provider");
const buildDuplicatePrompt =require("../prompts/duplicate.prompt");

class DuplicateDetectionService {

    async detect(articleId) {

        const article =
            await articleRepository.getArticleById(articleId);

        if (!article) {
            throw {
                status:404,
                message:"Article not found"
            };
        }

        // -------- keyword --------

        const keyword =
            article.module || article.title.split(" ")[0];

        // -------- candidate articles --------

        const candidates =
            await duplicateRepository.getCandidateArticles(
                keyword,
                articleId
            );

        if(candidates.length===0){

            return{
                duplicate:false,
                confidence:0,
                message:"No similar published articles found."
            };

        }

        const prompt =buildDuplicatePrompt(article,candidates);

        const response = await geminiProvider.generate(prompt);

        console.log("Raw Gemini Response:");
        console.log(response);

        const cleaned = response
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/, "")
            .trim();

        console.log("Cleaned Response:");
        console.log(cleaned);

        return JSON.parse(cleaned);
    }

}

module.exports=new DuplicateDetectionService();