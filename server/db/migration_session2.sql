-- ========================================================
-- SAP AMS -- Session 2 Database Migration
-- Run these commands in your PostgreSQL database (SAP_APP)
-- ========================================================

-- ── 1. Phone number and approval flags for users ───────────────────────
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(30) DEFAULT 'approved';

-- ── 2. Notification fields used by the notification repository ──────────
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS type VARCHAR(100),
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS reference_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS reference_id INTEGER,
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;

-- ── 3. Direct chat sessions (not tied to expert_requests) ────────────────
CREATE TABLE IF NOT EXISTS direct_chat_sessions (
    session_id  SERIAL PRIMARY KEY,
    user_a_id   INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    user_b_id   INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ── 4. Direct chat messages ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS direct_chat_messages (
    message_id  SERIAL PRIMARY KEY,
    session_id  INTEGER REFERENCES direct_chat_sessions(session_id) ON DELETE CASCADE,
    sender_id   INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ── 5. Admin-managed certifications ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_certifications (
    cert_id       SERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    content       TEXT,
    link          TEXT,
    departments   TEXT[] DEFAULT '{}',
    created_by    INTEGER REFERENCES users(user_id),
    created_at    TIMESTAMP DEFAULT NOW()
);

-- ── 6. User certification submissions ────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_certifications (
    id           SERIAL PRIMARY KEY,
    cert_id      INTEGER REFERENCES admin_certifications(cert_id) ON DELETE CASCADE,
    user_id      INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    file_path    TEXT,
    file_name    VARCHAR(255),
    file_type    VARCHAR(100),
    status       VARCHAR(30) DEFAULT 'pending'
                 CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMP DEFAULT NOW()
);

-- ── Done ─────────────────────────────────────────────────────────────────
SELECT 'Migration complete' AS status;
