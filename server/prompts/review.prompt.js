const buildReviewPrompt = (article) => {

    return `
You are an SAP Knowledge Management Expert.

Your task is to review the following article.

Return ONLY valid JSON.

Required Format:

{
    "summary":"",
    "module":"",
    "department":"",
    "severity":"",
    "suggestedTags":[]
}

Instructions:

1. Write ONLY a 2-3 line summary.

2. Detect SAP module.

3. Detect department.

4. Detect severity.

5. Suggest 5-10 tags.

6. Do not explain anything.

Article Title:

${article.title}

Current Module:

${article.module}

Department:

${article.department}

Severity:

${article.severity}

User Tags:

${article.tags}

Content:

${article.content}

Attachments:

${article.attachmentText}

`;

};

module.exports = buildReviewPrompt;