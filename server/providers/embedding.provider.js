// require("dotenv").config();

// const { GoogleGenAI } = require("@google/genai");

// const ai = new GoogleGenAI({
//     apiKey: process.env.LLM_API || process.env.GEMINI_API_KEY
// });

// class EmbeddingProvider {

//     async createEmbedding(text) {

//         const response = await ai.models.embedContent({

//             model: process.env.GEMINI_EMBEDDING_MODEL,

//             contents: text

//         });

//         return response.embeddings[0].values;

//     }

// }

// module.exports = new EmbeddingProvider();

// changed the code to test the database are the code


require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const apiKey = process.env.LLM_API || process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_EMBEDDING_MODEL?.trim() || "gemini-embedding-001";

if (!apiKey) {
    throw new Error("LLM_API or GEMINI_API_KEY is missing from server/.env");
}

const ai = new GoogleGenAI({
    apiKey
});

class EmbeddingProvider {

    async createEmbedding(text) {

        if (!text || !text.trim()) {
            throw new Error("Text is required to generate embedding");
        }

        const response = await ai.models.embedContent({
            model: modelName,
            contents: text
        });

        if (
            !response ||
            !response.embeddings ||
            !response.embeddings[0] ||
            !response.embeddings[0].values
        ) {
            console.error("Invalid Gemini embedding response:", response);
            throw new Error("Gemini did not return a valid embedding");
        }

        return response.embeddings[0].values;
    }
}

module.exports = new EmbeddingProvider();