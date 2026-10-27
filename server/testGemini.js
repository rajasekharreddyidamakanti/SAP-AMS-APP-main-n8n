const promptBuilder=require("./utils/promptBuilder");

const prompt=
promptBuilder.buildArticleReview({

title:"SAP MM",

module:"SAP MM",

department:"Procurement",

severity:"Medium",

tags:["Invoice"],

content:"Invoice verification process",

attachmentText:"PDF attachment text"

});

console.log(prompt);