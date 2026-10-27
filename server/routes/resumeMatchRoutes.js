const express = require('express');
const multer = require('multer');
const { matchResume } = require('../controllers/resumeMatchController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') return cb(null, true);
    return cb(new Error('Only PDF files are allowed'));
  },
});

// Add your existing auth middleware here, e.g. router.post('/', authenticate, upload.single('resume'), matchResume);
router.post('/', upload.single('resume'), matchResume);

module.exports = router;
