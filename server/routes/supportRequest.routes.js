// const express = require("express");
// const router = express.Router();
// const authMiddleware = require("../middleware/auth.middleware");
// const pool = require("../config/db");

// // Get all support requests for an admin or L1/L2
// // router.get("/", authMiddleware, async (req, res) => {
// //     try {
// //         const result = await pool.query(`SELECT * FROM support_requests ORDER BY created_at DESC`);

// //  I have been Replaced with it to test it
// router.get("/", authMiddleware, async (req, res) => {
//     try {
//         const result = await pool.query(
//             `SELECT sr.*, u.name AS assigned_to_name
//              FROM support_requests sr
//              LEFT JOIN users u ON sr.assigned_to = u.user_id
//              ORDER BY sr.created_at DESC`
//         );        
//         res.json({ success: true, data: result.rows });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// // Get my support requests
// router.get("/my", authMiddleware, async (req, res) => {
//     try {
//         const result = await pool.query(
//             `SELECT * FROM support_requests WHERE requester_id = $1 ORDER BY created_at DESC`,
//             [req.user.userId]
//         );
//         res.json({ success: true, data: result.rows });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// // Get support request by ID
// router.get("/:id", authMiddleware, async (req, res) => {
//     try {
//         const result = await pool.query(
//             `SELECT * FROM support_requests WHERE request_id = $1`,
//             [req.params.id]
//         );
//         if (result.rows.length === 0) {
//             return res.status(404).json({ message: "Support request not found" });
//         }
//         res.json({ success: true, data: result.rows[0] });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// // Create a support request
// router.post("/", authMiddleware, async (req, res) => {
//     try {
//         const { title, description, module, priority, deadline, notify_all } = req.body;
        
//         let dl = deadline ? new Date(deadline) : null;

//         const result = await pool.query(
//             `INSERT INTO support_requests (title, description, module, priority, deadline, notify_all, requester_id)
//              VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
//             [title, description, module, priority || "medium", dl, !!notify_all, req.user.userId]
//         );
//         res.status(201).json({ success: true, data: result.rows[0] });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// // Update support request details
// router.put("/:id", authMiddleware, async (req, res) => {
//     try {
//         const { title, description, module, priority, deadline, notify_all, status } = req.body;
//         let dl = deadline ? new Date(deadline) : null;
//         const result = await pool.query(
//             `UPDATE support_requests 
//              SET title = COALESCE($1, title),
//                  description = COALESCE($2, description),
//                  module = COALESCE($3, module),
//                  priority = COALESCE($4, priority),
//                  deadline = COALESCE($5, deadline),
//                  notify_all = COALESCE($6, notify_all),
//                  status = COALESCE($7, status),
//                  updated_at = NOW()
//              WHERE request_id = $8 RETURNING *`,
//             [title, description, module, priority, dl, notify_all, status, req.params.id]
//         );
//         res.json({ success: true, data: result.rows[0] });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// // Update support request status
// router.put("/:id/close", authMiddleware, async (req, res) => {
//     try {
//         const result = await pool.query(
//             // `UPDATE support_requests SET status = 'closed', updated_at = NOW() WHERE request_id = $1 RETURNING *`, replaced for testing the data
//             `UPDATE support_requests SET status = 'closed', resolved_at = NOW() WHERE request_id = $1 RETURNING *`,
//             [req.params.id]
//         );
//         res.json({ success: true, data: result.rows[0] });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });
// // Assign support request to the current admin

// // I have been added for Testing the data for the project
// // router.put("/:id/assign", authMiddleware, async (req, res) => {
// //     try {
// //         const result = await pool.query(
// //             `UPDATE support_requests
// //              SET status = 'assigned', assigned_to = $1, updated_at = NOW()
// //              WHERE request_id = $2 RETURNING *`,
// //             [req.user.userId, req.params.id]
// //         );

// // 

// router.put("/:id/assign", authMiddleware, async (req, res) => {
//     try {
//         const result = await pool.query(
//             `UPDATE support_requests
//              SET status = 'assigned', assigned_to = $1, resolved_at = NOW()
//              WHERE request_id = $2 RETURNING *`,
//             [req.user.userId, req.params.id]
//         );
// // 

//         res.json({ success: true, data: result.rows[0] });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });


// // Escalate support request
// router.put("/:id/escalate", authMiddleware, async (req, res) => {
//     try {
//         const result = await pool.query(
//             // `UPDATE support_requests SET status = 'escalated', priority = 'high', updated_at = NOW() WHERE request_id = $1 RETURNING *`, replaced for testing the data
//             `UPDATE support_requests SET status = 'escalated', priority = 'high', escalated = true, resolved_at = NOW() WHERE request_id = $1 RETURNING *`,
//             [req.params.id]
//         );
//         res.json({ success: true, data: result.rows[0] });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// module.exports = router;

// changed for testing the data in the project

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const pool = require("../config/db");

// Get all support requests for an admin or L1/L2
router.get("/", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT sr.*, u.name AS assigned_to_name
             FROM support_requests sr
             LEFT JOIN users u ON sr.assigned_to = u.user_id
             ORDER BY sr.created_at DESC`
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get my support requests
router.get("/my", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM support_requests WHERE requester_id = $1 ORDER BY created_at DESC`,
            [req.user.userId]
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get support request by ID
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM support_requests WHERE request_id = $1`,
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Support request not found" });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a support request
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { title, description, module, priority, deadline, notify_all } = req.body;

        let dl = deadline ? new Date(deadline) : null;

        const result = await pool.query(
            `INSERT INTO support_requests (title, description, module, priority, deadline, notify_all, requester_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [title, description, module, priority || "medium", dl, !!notify_all, req.user.userId]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update support request details
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { title, description, module, priority, deadline, notify_all, status } = req.body;
        let dl = deadline ? new Date(deadline) : null;
        const result = await pool.query(
            `UPDATE support_requests 
             SET title = COALESCE($1, title),
                 description = COALESCE($2, description),
                 module = COALESCE($3, module),
                 priority = COALESCE($4, priority),
                 deadline = COALESCE($5, deadline),
                 notify_all = COALESCE($6, notify_all),
                 status = COALESCE($7, status),
                 resolved_at = NOW()
             WHERE request_id = $8 RETURNING *`,
            [title, description, module, priority, dl, notify_all, status, req.params.id]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Assign support request to a specific user (defaults to the caller
// themselves if no user_id is given — keeps "Assign to me" working).
router.put("/:id/assign", authMiddleware, async (req, res) => {
    try {
        const assigneeId = req.body.user_id || req.user.userId;

        const result = await pool.query(
            `UPDATE support_requests
             SET status = 'assigned', assigned_to = $1, resolved_at = NOW()
             WHERE request_id = $2 RETURNING *`,
            [assigneeId, req.params.id]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Close support request


// Resolve support request — marks the underlying issue as fixed,
// distinct from "Closed" which just archives the ticket.
router.put("/:id/resolve", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `UPDATE support_requests SET status = 'resolved', resolved_at = NOW() WHERE request_id = $1 RETURNING *`,
            [req.params.id]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.put("/:id/close", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `UPDATE support_requests SET status = 'closed', resolved_at = NOW() WHERE request_id = $1 RETURNING *`,
            [req.params.id]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Escalate support request — optionally hand it to a specific
// L2/L3/expert user at the same time (falls back to just flagging
// it as escalated with no reassignment if user_id isn't given).
router.put("/:id/escalate", authMiddleware, async (req, res) => {
    try {
        const assigneeId = req.body.user_id || null;

        const result = await pool.query(
            `UPDATE support_requests
             SET status = 'escalated',
                 priority = 'high',
                 assigned_to = COALESCE($1, assigned_to),
                 resolved_at = NOW()
             WHERE request_id = $2 RETURNING *`,
            [assigneeId, req.params.id]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        await pool.query(`DELETE FROM support_requests WHERE request_id = $1`, [req.params.id]);
        res.json({ success: true, message: "Support request deleted." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;