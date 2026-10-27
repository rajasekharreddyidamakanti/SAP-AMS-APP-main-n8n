// server/routes/aiBot.routes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const gemini = require("../providers/gemini.provider");

const SYSTEM_INTRO = `You are ARIA (AMS Resource & Intelligence Assistant), the official AI assistant for the SAP AMS (Application Management Services) Knowledge Portal.

Your role is to help all portal users — employees, L1/L2 support staff, experts, team leads, and admins — with questions about:
- SAP modules: FI (Finance), CO (Controlling), MM (Materials Management), SD (Sales & Distribution), HR (Human Resources), PP (Production Planning), QM (Quality Management), PM (Plant Maintenance), PS (Project System), BASIS
- AMS processes: incident management, change requests, knowledge transfer, KT sessions, shadow support, reverse shadow, hypercare
- Portal features: creating/finding articles, support tickets, expert requests, certifications, transition checklists, team management, phone directory, notifications, chat
- SAP transactions, T-codes, error messages, and troubleshooting
- General IT/AMS best practices

Guidelines:
- Be concise, professional, and friendly
- Use bullet points and formatting for clarity
- If you do not know something, say so honestly
- Never make up SAP transaction codes or processes you are unsure about

You cannot directly access the portal database or perform actions for users. You provide guidance, information, and advice only. Do you understand?`;

const SYSTEM_ACK = `Yes, I understand completely. I am ARIA, the SAP AMS AI assistant. I'm ready to help users with SAP module questions, AMS processes, portal navigation, T-codes, troubleshooting, and best practices. How can I assist you today?`;

// POST /api/ai-bot/chat
// Body: { message: string, history: [{role: "user"|"model", text: string}] }
router.post("/chat", authMiddleware, async (req, res) => {
    try {
        const { message, history = [] } = req.body;
        if (!message?.trim()) {
            return res.status(400).json({ success: false, message: "Message is required." });
        }

        // Build the full contents array:
        // 1. Synthetic priming exchange so Gemini knows its role (works in all SDK versions)
        const contents = [
            { role: "user",  parts: [{ text: SYSTEM_INTRO }] },
            { role: "model", parts: [{ text: SYSTEM_ACK }] },
        ];

        // 2. Actual conversation history (skip first bot greeting which was a UI thing)
        for (const turn of history) {
            contents.push({
                role: turn.role,
                parts: [{ text: turn.text }],
            });
        }

        // 3. The current user message
        contents.push({
            role: "user",
            parts: [{ text: message }],
        });

        // Use the shared Gemini provider (already handles API key + errors)
        const reply = await gemini.generate(contents);

        res.json({ success: true, reply: reply?.trim() || "I'm sorry, I couldn't generate a response right now. Please try again." });

    } catch (err) {
        console.error("AI Bot error:", err);
        if (err.status === 429) {
            return res.status(429).json({ success: false, message: "AI quota exceeded. Please try again in a moment." });
        }
        res.status(500).json({ success: false, message: err.message || "Failed to get AI response." });
    }
});

module.exports = router;
