// server/routes/adminCertifications.routes.js
// const express  = require("express");
// const router   = express.Router();
// const auth     = require("../middleware/auth.middleware");
// const pool     = require("../config/db");
// const multer   = require("multer");
// const path     = require("path");
// const fs       = require("fs");

// // ── File upload config ────────────────────────────────────────────────────
// const uploadDir = path.join(__dirname, "../../uploads/certifications");
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// 

const express  = require("express");
const router   = express.Router();
const auth     = require("../middleware/auth.middleware");
const pool     = require("../config/db");
const multer   = require("multer");
const path     = require("path");
const fs       = require("fs");
const uploadConfig = require("../config/upload");

// ── File upload config ────────────────────────────────────────────────────
// Must live inside the SAME root that server/index.js serves statically
// (config/upload.js), or "View File" links will 404 with "Cannot GET".
const uploadDir = path.join(uploadConfig.PATH, "certifications");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename:    (_req, file, cb)  => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, "_")}`),
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (_req, file, cb) => {
        const allowed = /\.(png|jpg|jpeg|pdf|doc|docx)$/i;
        if (!allowed.test(path.extname(file.originalname))) {
            return cb(new Error("Only images, PDF, and DOC files are allowed"));
        }
        cb(null, true);
    },
});

// ── GET /api/admin-certifications ─────────────────────────────────────────
// All certifications (filtered to user's dept on frontend)
router.get("/", auth, async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT * FROM admin_certifications ORDER BY created_at DESC`
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── POST /api/admin-certifications ────────────────────────────────────────
// Admin creates a certification
router.post("/", auth, async (req, res) => {
    try {
        const { name, content, link, departments, due_date } = req.body;
        const { rows } = await pool.query(
            `INSERT INTO admin_certifications (name, content, link, departments, due_date, created_by, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
            [name, content || null, link || null, departments || [], due_date || null, req.user.userId]
        );
        res.status(201).json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/admin-certifications/my-submissions ─────────────────────────
// Current user's submissions
router.get("/my-submissions", auth, async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT uc.*, ac.name AS cert_name, ac.content AS cert_content, ac.link AS cert_link
             FROM user_certifications uc
             JOIN admin_certifications ac ON uc.cert_id = ac.cert_id
             WHERE uc.user_id = $1
             ORDER BY uc.submitted_at DESC`,
            [req.user.userId]
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/admin-certifications/all-submissions ────────────────────────
// Admin: all user submissions
router.get("/all-submissions", auth, async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT uc.*, ac.name AS cert_name, u.name AS user_name, u.email AS user_email
             FROM user_certifications uc
             JOIN admin_certifications ac ON uc.cert_id = ac.cert_id
             JOIN users u ON uc.user_id = u.user_id
             ORDER BY uc.submitted_at DESC`
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/admin-certifications/:id/department-submissions ─────────────
// Admin: all users from the cert's department(s), with their submission status
router.get("/:id/department-submissions", auth, async (req, res) => {
    try {
        const certId = req.params.id;
        // Get the cert to know target departments
        const certRes = await pool.query("SELECT * FROM admin_certifications WHERE cert_id = $1", [certId]);
        if (!certRes.rows.length) return res.status(404).json({ success: false, message: "Certification not found" });
        const cert = certRes.rows[0];
        const depts = cert.departments || [];

        // Get all users from those departments
        let usersQuery;
        let usersParams;
        if (depts.includes("All") || depts.length === 0) {
            // usersQuery = "SELECT user_id, name, email, department, phone FROM users WHERE status = 'approved' ORDER BY name";
            // usersParams = [];
            usersQuery = "SELECT user_id, name, email, department, phone_number AS phone FROM users WHERE approval_status = 'approved' ORDER BY name";
        } else {
            // usersQuery = "SELECT user_id, name, email, department, phone FROM users WHERE status = 'approved' AND department = ANY($1) ORDER BY name";
            usersQuery = "SELECT user_id, name, email, department, phone_number AS phone FROM users WHERE approval_status = 'approved' AND department = ANY($1) ORDER BY name";
            usersParams = [depts];
        }
        const usersRes = await pool.query(usersQuery, usersParams);

        // Get all submissions for this cert
        const subsRes = await pool.query(
            "SELECT * FROM user_certifications WHERE cert_id = $1",
            [certId]
        );
        const submissionsMap = {};
        subsRes.rows.forEach(s => { submissionsMap[s.user_id] = s; });

        // Merge
        const result = usersRes.rows.map(u => ({
            ...u,
            submission: submissionsMap[u.user_id] || null,
        }));

        res.json({ success: true, data: result, cert });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── POST /api/admin-certifications/submit ────────────────────────────────
// User submits proof for a certification
router.post("/submit", auth, upload.single("file"), async (req, res) => {
    try {
        const { cert_id } = req.body;
        const userId      = req.user.userId;

        if (!cert_id) return res.status(400).json({ success: false, message: "cert_id is required" });

        // Check if cert has due_date and if it's past
        const certRes = await pool.query("SELECT due_date FROM admin_certifications WHERE cert_id = $1", [cert_id]);
        const cert = certRes.rows[0];
        const isPastDue = cert && cert.due_date && new Date() > new Date(cert.due_date);

        const filePath  = req.file ? `/uploads/certifications/${req.file.filename}` : null;
        const fileName  = req.file ? req.file.originalname : null;
        const fileType  = req.file ? req.file.mimetype : null;

        // If past due, set status to 'pending_late' so admin must approve
        const status = isPastDue ? 'pending_late' : 'pending';

        // Upsert: if user already submitted for this cert, replace
        const existing = await pool.query(
            `SELECT id FROM user_certifications WHERE cert_id = $1 AND user_id = $2`,
            [cert_id, userId]
        );

        if (existing.rows.length > 0) {
            await pool.query(
                `UPDATE user_certifications
                 SET file_path=$1, file_name=$2, file_type=$3, status=$4, submitted_at=NOW()
                 WHERE cert_id=$5 AND user_id=$6`,
                [filePath, fileName, fileType, status, cert_id, userId]
            );
        } else {
            await pool.query(
                `INSERT INTO user_certifications (cert_id, user_id, file_path, file_name, file_type, status, submitted_at)
                 VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
                [cert_id, userId, filePath, fileName, fileType, status]
            );
        }

        const message = isPastDue
            ? "Certificate submitted after the due date. It will require admin approval."
            : "Certificate submitted successfully";

        res.json({ success: true, message, isPastDue });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── PUT /api/admin-certifications/submission/:id/approve ─────────────────
// Admin approves a submission
router.put("/submission/:id/approve", auth, async (req, res) => {
    try {
        await pool.query(
            `UPDATE user_certifications SET status='approved' WHERE id=$1`,
            [req.params.id]
        );
        res.json({ success: true, message: "Approved" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── PUT /api/admin-certifications/submission/:id/reject ──────────────────
// Admin rejects a submission
router.put("/submission/:id/reject", auth, async (req, res) => {
    try {
        await pool.query(
            `UPDATE user_certifications SET status='rejected' WHERE id=$1`,
            [req.params.id]
        );
        res.json({ success: true, message: "Rejected" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

// ── DELETE /api/admin-certifications/submission/:id ──────────────────────
// Admin deletes a submission entirely (and its uploaded file, if any)
router.delete("/submission/:id", auth, async (req, res) => {
    try {
        const { rows } = await pool.query(
            `DELETE FROM user_certifications WHERE id=$1 RETURNING *`,
            [req.params.id]
        );

        if (!rows.length) {
            return res.status(404).json({ success: false, message: "Submission not found" });
        }

        const filePath = rows[0].file_path; // e.g. "/uploads/certifications/xyz.png"
        if (filePath) {
            const absolutePath = path.join(uploadConfig.PATH, filePath.replace(/^\/uploads[\\/]/, ""));
            fs.unlink(absolutePath, () => {}); // best-effort cleanup, ignore errors
        }

        res.json({ success: true, message: "Submission deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});