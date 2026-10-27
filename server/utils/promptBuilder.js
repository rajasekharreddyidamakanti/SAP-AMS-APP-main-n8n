const buildReviewPrompt =
    require("../prompts/review.prompt");

const promptBuilder = {

    buildArticleReview(article) {

        return buildReviewPrompt(article);

    }

};

module.exports = promptBuilder;