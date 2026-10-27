const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth.middleware");
const pool    = require("../config/db");
const notificationService = require("../services/notification.service");

// ── GET /api/chat/contacts ─────────────────────────────────────────────────
// Returns eligible chat contacts (excluding current user).
// router.get("/contacts", auth, async (req, res) => {
//     try {
//         const userId = req.user.userId;
//         const { rows } = await pool.query(
//             `SELECT DISTINCT u.user_id, u.name, u.email, u.department, u.phone_number,
//                 ARRAY_AGG(DISTINCT r.role_name) FILTER (WHERE r.role_name IS NOT NULL) AS roles,
//                 COUNT(ka.article_id) AS article_count
//              FROM knowledge_articles ka
//              JOIN users u ON ka.created_by = u.user_id
//              LEFT JOIN user_roles ur ON u.user_id = ur.user_id
//              LEFT JOIN roles r ON ur.role_id = r.role_id
//              WHERE ka.status = 'published'
//                AND u.user_id != $1
//              GROUP BY u.user_id, u.name, u.email, u.department, u.phone_number
//              ORDER BY article_count DESC`,
//             [userId]
//         );
//         res.json({ success: true, data: rows });
//     } catch (err) {
//         res.status(500).json({ success: false, message: err.message });
//     }
// });
// Replaced the above lines with the below to test the data
router.get("/contacts", auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { rows } = await pool.query(
            `SELECT u.user_id, u.name, u.email, u.department, u.phone_number,
                ARRAY_AGG(DISTINCT r.role_name) FILTER (WHERE r.role_name IS NOT NULL) AS roles,
                COUNT(DISTINCT ka.article_id) AS article_count
             FROM users u
             LEFT JOIN knowledge_articles ka
                ON ka.created_by = u.user_id AND ka.status = 'published'
             LEFT JOIN user_roles ur ON u.user_id = ur.user_id
             LEFT JOIN roles r ON ur.role_id = r.role_id
             WHERE u.user_id != $1
            AND u.is_active = TRUE
            AND u.is_approved = TRUE
             GROUP BY u.user_id, u.name, u.email, u.department, u.phone_number
             ORDER BY article_count DESC`,
            [userId]
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 
// ── POST /api/chat/start ───────────────────────────────────────────────────
// Start or get existing direct chat session between two users
router.post("/start", auth, async (req, res) => {
    try {
        const initiatorId   = req.user.userId;
        const { recipient_id } = req.body;

        if (!recipient_id) {
            return res.status(400).json({ success: false, message: "recipient_id is required" });
        }

        // Check for existing direct session between these two users
        const existing = await pool.query(
            `SELECT session_id FROM direct_chat_sessions
             WHERE (user_a_id = $1 AND user_b_id = $2)
                OR (user_a_id = $2 AND user_b_id = $1)
             LIMIT 1`,
            [initiatorId, recipient_id]
        );

        let sessionId;
        let isNew = false;

        if (existing.rows.length > 0) {
            sessionId = existing.rows[0].session_id;
        } else {
            // Create new direct session
            const newSession = await pool.query(
                `INSERT INTO direct_chat_sessions (user_a_id, user_b_id, created_at)
                 VALUES ($1, $2, NOW()) RETURNING session_id`,
                [initiatorId, recipient_id]
            );
            sessionId = newSession.rows[0].session_id;
            isNew     = true;

            // Create in-app notification for recipient
            await notificationService.createNotification({
                user_id: recipient_id,
                type: "chat_request",
                title: "New Chat Session",
                message: "Someone wants to chat with you on the portal. Go to the Chat section to respond.",
                reference_type: "chat_session",
                reference_id: sessionId
            }).catch(() => {});
        }

        // Send email notification (graceful — only if smtp configured)
        if (isNew) {
            try {
                const [initRow, recRow] = await Promise.all([
                    pool.query("SELECT name FROM users WHERE user_id=$1", [initiatorId]),
                    pool.query("SELECT name, email FROM users WHERE user_id=$1", [recipient_id]),
                ]);
                const initiatorName  = initRow.rows[0]?.name || "A user";
                const recipientEmail = recRow.rows[0]?.email;

                if (recipientEmail && process.env.SMTP_HOST && process.env.SMTP_USER) {
                    const nodemailer = require("nodemailer");
                    const transporter = nodemailer.createTransport({
                        host: process.env.SMTP_HOST,
                        port: parseInt(process.env.SMTP_PORT || "587"),
                        secure: false,
                        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
                    });
                    await transporter.sendMail({
                        from: `"SAP AMS Platform" <${process.env.SMTP_USER}>`,
                        to: recipientEmail,
                        subject: `${initiatorName} wants to chat with you – SAP AMS`,
                        html: `<div style="font-family:sans-serif;max-width:480px;padding:24px;border:1px solid #E0E0E0;border-radius:8px;">
                            <h2 style="color:#0A1929">New Chat Request</h2>
                            <p style="color:#607D8B;"><strong>${initiatorName}</strong> has started a conversation with you on the SAP AMS Portal.</p>
                            <p style="color:#607D8B;">Please log in to <strong>continue the chat on the portal</strong>.</p>
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/chat"
                               style="display:inline-block;margin-top:16px;padding:10px 24px;background:#1565C0;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
                              Open Chat on Portal
                            </a>
                        </div>`,
                    });
                }
            } catch (emailErr) {
                console.warn("Email notification skipped:", emailErr.message);
            }
        }

        res.json({ success: true, data: { session_id: sessionId, is_new: isNew } });
    } catch (err) {
        console.error("Chat start error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/chat/:sessionId/messages ──────────────────────────────────────
router.get("/:sessionId/messages", auth, async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT dcm.*, u.name AS sender_name
             FROM direct_chat_messages dcm
             JOIN users u ON dcm.sender_id = u.user_id
             WHERE dcm.session_id = $1
             ORDER BY dcm.created_at ASC`,
            [req.params.sessionId]
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── POST /api/chat/:sessionId/messages ────────────────────────────────────
router.post("/:sessionId/messages", auth, async (req, res) => {
    try {
        const content  = req.body.content || req.body.message;
        const senderId = req.user.userId;
        if (!content) return res.status(400).json({ success: false, message: "content is required" });

        const { rows } = await pool.query(
            `INSERT INTO direct_chat_messages (session_id, sender_id, content, created_at)
             VALUES ($1, $2, $3, NOW()) RETURNING *`,
            [req.params.sessionId, senderId, content]
        );

        // Notify recipient
        const session = await pool.query(
            `SELECT user_a_id, user_b_id FROM direct_chat_sessions WHERE session_id = $1`,
            [req.params.sessionId]
        );
        if (session.rows.length > 0) {
            const recipientId = session.rows[0].user_a_id == senderId ? session.rows[0].user_b_id : session.rows[0].user_a_id;
            
            // Get sender name for a better notification
            const senderInfo = await pool.query('SELECT name FROM users WHERE user_id = $1', [senderId]);
            const senderName = senderInfo.rows[0]?.name || "Someone";
            
            await notificationService.createNotification({
                user_id: recipientId,
                type: "chat_message",
                title: "New Chat Message",
                message: `${senderName} sent you a new message.`,
                reference_type: "chat_session",
                reference_id: req.params.sessionId
            }).catch((err) => console.log("Notif error", err.message));
        }

        res.status(201).json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── Keep original session-based routes for backward compat ────────────────
const chatController = require("../controllers/chat.controller");
router.get( "/session/:sessionId",       auth, chatController.getSession);
router.put( "/session/:sessionId/close", auth, chatController.closeSession);

module.exports = router;