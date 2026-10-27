// require("dotenv").config();

// const { GoogleGenAI } = require("@google/genai");

// const requestedModel = process.env.LLM_MODEL?.trim();
// const modelName = requestedModel && !requestedModel.toLowerCase().includes("gemini 3")
//     ? requestedModel
//     : "gemini-2.0-flash";

// const ai = new GoogleGenAI({
//     apiKey: process.env.LLM_API || process.env.GEMINI_API_KEY
// });

// class GeminiProvider {

//     async generate(prompt) {

//         try {

//             const response =
//                 await ai.models.generateContent({

//                     model: modelName,

//                     contents: prompt

//                 });

//             return response.text;

//         } catch (error) {
//             console.error("Gemini Error:", error);
//             if (error.status === 429) {
//                 throw {
//                     status: 429,
//                     message: "Gemini API quota exceeded. Please retry later or use another API key."
//                 };
//             }
//             throw {
//                 status: 500,
//                 message: error.message
//             };  
//         }

//     }

// }

// module.exports = new GeminiProvider();



// changed for testing the database


require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const apiKey = process.env.LLM_API || process.env.GEMINI_API_KEY;
const modelName = process.env.LLM_MODEL?.trim() || "gemini-3.6-flash";

if (!apiKey) {
    throw new Error("LLM_API or GEMINI_API_KEY is missing from server/.env");
}

const ai = new GoogleGenAI({
    apiKey
});

class GeminiProvider {

    async generate(prompt) {
        try {
            const response = await ai.models.generateContent({
                model: modelName,
                contents: prompt
            });
            return response.text;
        } catch (error) {
            console.error("Gemini Error:", error);
            if (error.status === 429) {
                throw {
                    status: 429,
                    message: "Gemini API quota exceeded. Please retry later or use another API key."
                };
            }
            throw {
                status: 500,
                message: error.message
            };
        }
    }
}

module.exports = new GeminiProvider();