const articleRepository =
require("../repositories/article.repository");

const attachmentRepository =
require("../repositories/attachmentText.repository");

const promptBuilder =
require("../utils/promptBuilder");

const gemini =
require("../providers/gemini.provider");

class AIReviewService {

    async reviewArticle(articleId){

        const article =
        await articleRepository.getArticleById(articleId);

        if(!article){

            throw{

                status:404,
                message:"Article not found"

            };

        }

        const attachments =
        await articleRepository.getAttachments(articleId);

        const attachmentText =
        await attachmentRepository.getAttachmentText(
            attachments
        );

        const prompt =
        promptBuilder.buildArticleReview({

            ...article,

            attachmentText

        });

        const response =
        await gemini.generate(prompt);

        return this.cleanResponse(response);

    }

    cleanResponse(response){

        try{

            let text=response.trim();

            text=text.replace("```json","");

            text=text.replace("```","");

            text=text.trim();

            return JSON.parse(text);

        }

        catch(error){

            console.log(error);

            throw{

                status:500,

                message:"Invalid AI response"

            };

        }

    }

}

module.exports=new AIReviewService();