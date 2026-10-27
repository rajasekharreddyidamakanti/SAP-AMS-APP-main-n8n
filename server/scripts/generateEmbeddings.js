require("dotenv").config();

const articleRepository =
require("../repositories/article.repository");

const embeddingService =
require("../services/embedding.service");

async function generateEmbeddings() {

    const articles =
    await articleRepository.getPublishedArticlesWithoutEmbedding();

    console.log(`Found ${articles.length} articles`);

    for(const article of articles){

        const text=[

            article.title,
            article.summary,
            article.content,
            article.module,
            article.department,
            article.severity,
            ...(article.tags || [])

        ].join("\n");

        console.log(
            `Generating embedding for Article ${article.article_id}`
        );

        const embedding=
        await embeddingService.generateEmbedding(text);

        await articleRepository.updateEmbedding(
            article.article_id,
            embedding
        );

        console.log(
            `✔ Saved embedding for ${article.article_id}`
        );

    }

    console.log("Done");

}

generateEmbeddings()
.catch(console.error);