function buildDuplicatePrompt(currentArticle, publishedArticles) {

    return `
You are an SAP Knowledge Base Duplicate Detection AI.

Compare the CURRENT ARTICLE with the list of PUBLISHED ARTICLES.

CURRENT ARTICLE

Title:
${currentArticle.title}

Summary:
${currentArticle.summary}

Module:
${currentArticle.module}

Content:
${currentArticle.content}

------------------------------------------------

PUBLISHED ARTICLES

${publishedArticles.map((article, index) => `
Article ${index + 1}

ID:
${article.article_id}

Title:
${article.title}

Summary:
${article.summary}

Module:
${article.module}

Content:
${article.content}
`).join("\n")}

------------------------------------------------

Return ONLY JSON.

{
  "duplicate": true,
  "confidence": 95,
  "matchedArticleId": 12,
  "reason": "Explain briefly why it is duplicate."
}
`;

}

module.exports = buildDuplicatePrompt;