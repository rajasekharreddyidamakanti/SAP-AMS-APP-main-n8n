BEGIN;

-- ------------------------------------------------------------
-- Clean migration for the SAP AMS app
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    phone_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    is_approved BOOLEAN DEFAULT TRUE,
    approval_status VARCHAR(30) DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS knowledge_articles (
    article_id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    summary TEXT,
    module TEXT,
    severity VARCHAR(50) CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'under_review', 'co_author_pending', 'published', 'rejected')),
    tags TEXT[] DEFAULT '{}',
    embedding JSONB,
    visibility VARCHAR(100) DEFAULT 'employee',
    department VARCHAR(100),
    created_by INTEGER REFERENCES users(user_id),
    approved_by INTEGER REFERENCES users(user_id),
    co_author_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    co_author_status VARCHAR(30) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS related_articles (
    article_id INTEGER REFERENCES knowledge_articles(article_id) ON DELETE CASCADE,
    related_id INTEGER REFERENCES knowledge_articles(article_id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, related_id)
); 

CREATE TABLE IF NOT EXISTS article_access (
    article_id INTEGER REFERENCES knowledge_articles(article_id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(role_id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, role_id)
);

CREATE TABLE IF NOT EXISTS article_visibility_roles (
    article_id INTEGER REFERENCES knowledge_articles(article_id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(role_id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, role_id)
);

CREATE TABLE IF NOT EXISTS article_sections (
    section_id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES knowledge_articles(article_id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT,
    tags TEXT[] DEFAULT '{}',
    section_order INTEGER
);

CREATE TABLE IF NOT EXISTS expertise_tags (
    tag_id SERIAL PRIMARY KEY,
    tag_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    status VARCHAR(30) DEFAULT 'pending',
    approved_by INTEGER REFERENCES users(user_id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_tags (
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES expertise_tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, tag_id)
);

CREATE TABLE IF NOT EXISTS role_tags (
    role_id INTEGER REFERENCES roles(role_id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES expertise_tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, tag_id)
);

CREATE TABLE IF NOT EXISTS article_tags (
    article_id INTEGER REFERENCES knowledge_articles(article_id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES expertise_tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

CREATE TABLE IF NOT EXISTS section_tags (
    section_id INTEGER REFERENCES article_sections(section_id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES expertise_tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (section_id, tag_id)
);

CREATE TABLE IF NOT EXISTS transition_phases (
    phase_id SERIAL PRIMARY KEY,
    phase_name VARCHAR(100) UNIQUE NOT NULL,
    phase_order INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transition_tasks (
    task_id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    phase_id INTEGER REFERENCES transition_phases(phase_id),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
    due_date DATE,
    assigned_to INTEGER REFERENCES users(user_id),
    completed_at TIMESTAMP,
    signed_off_by INTEGER REFERENCES users(user_id),
    sign_off_notes TEXT,
    depends_on_task_id INTEGER REFERENCES transition_tasks(task_id) ON DELETE SET NULL,
    transition_id INTEGER REFERENCES transitions(transition_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task_dependencies (
    task_id INTEGER REFERENCES transition_tasks(task_id) ON DELETE CASCADE,
    depends_on_id INTEGER REFERENCES transition_tasks(task_id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, depends_on_id)
);

CREATE TABLE IF NOT EXISTS checklist_templates (
    template_id SERIAL PRIMARY KEY,
    phase_id INTEGER NOT NULL REFERENCES transition_phases(phase_id) ON DELETE CASCADE,
    checklist_item VARCHAR(500) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS transition_checklist (
    checklist_id SERIAL PRIMARY KEY,
    transition_id INTEGER NOT NULL REFERENCES transitions(transition_id) ON DELETE CASCADE,
    template_id INTEGER NOT NULL REFERENCES checklist_templates(template_id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    remarks TEXT,
    completed_by INTEGER REFERENCES users(user_id),
    completed_at TIMESTAMP,
    UNIQUE (transition_id, template_id)
);

CREATE TABLE IF NOT EXISTS transition_task_attachments (
    attachment_id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES transition_tasks(task_id) ON DELETE CASCADE,
    file_name VARCHAR(500) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(255),
    uploaded_by INTEGER REFERENCES users(user_id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS onboarding_members (
    member_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    role_assigned VARCHAR(255),
    start_date DATE,
    target_completion_date DATE,
    overall_status VARCHAR(50) DEFAULT 'in_progress' CHECK (overall_status IN ('not_started', 'in_progress', 'certified')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_modules (
    module_id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    sap_module VARCHAR(100),
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_assignments (
    assignment_id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES onboarding_members(member_id) ON DELETE CASCADE,
    module_id INTEGER REFERENCES training_modules(module_id),
    status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    completed_at TIMESTAMP,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS key_contacts (
    contact_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(255),
    sap_module VARCHAR(100),
    escalation_level INTEGER CHECK (escalation_level IN (1, 2, 3)),
    is_on_call BOOLEAN DEFAULT FALSE,
    on_call_start TIME,
    on_call_end TIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS key_contacts_user_id_key
    ON key_contacts (user_id)
    WHERE user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS escalation_paths (
    path_id SERIAL PRIMARY KEY,
    sap_module VARCHAR(100) NOT NULL UNIQUE,
    level_1_contact INTEGER REFERENCES key_contacts(contact_id),
    level _2_contact INTEGER REFERENCES key_contacts(contact_id),
    level_3_contact INTEGER REFERENCES key_contacts(contact_id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_requests (
    request_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES expertise_tags(tag_id),
    title VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    module VARCHAR(255),
    deadline TIMESTAMP,
    priority VARCHAR(30),
    notify_all BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    remarks TEXT
);

CREATE TABLE IF NOT EXISTS request_users (
    request_id INTEGER REFERENCES support_requests(request_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    PRIMARY KEY (request_id, user_id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
    message_id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES support_requests(request_id),
    sender_id INTEGER REFERENCES users(user_id),
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    type VARCHAR(100),
    title VARCHAR(255),
    message TEXT,
    reference_type VARCHAR(100),
    reference_id INTEGER,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_query_history (
    query_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    question TEXT,
    response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS article_attachments (
    attachment_id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES knowledge_articles(article_id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(100),
    uploaded_by INTEGER REFERENCES users(user_id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attachment_tags (
    attachment_id INTEGER REFERENCES article_attachments(attachment_id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES expertise_tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (attachment_id, tag_id)
);

CREATE TABLE IF NOT EXISTS expert_requests (
    request_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    expert_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    module VARCHAR(255),
    article_id INTEGER REFERENCES knowledge_articles(article_id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'accepted', 'resolved', 'closed', 'escalated', 'rejected', 'expired', 'timeout')),
    deadline TIMESTAMP,
    timeout_processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_requests (
    request_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(role_id),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by INTEGER REFERENCES users(user_id),
    approved_at TIMESTAMP,
    deadline TIMESTAMP,
    remarks TEXT,
    rejection_message TEXT
);

CREATE TABLE IF NOT EXISTS tag_requests (
    request_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    tag_name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by INTEGER REFERENCES users(user_id),
    approved_at TIMESTAMP,
    deadline TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_certifications (
    cert_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    content TEXT,
    link TEXT,
    departments TEXT[] DEFAULT '{}',
    due_date TIMESTAMP,
    created_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_certifications (
    id SERIAL PRIMARY KEY,
    cert_id INTEGER REFERENCES admin_certifications(cert_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    file_path TEXT,
    file_name VARCHAR(255),
    file_type VARCHAR(100),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS direct_chat_sessions (
    session_id SERIAL PRIMARY KEY,
    user_a_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    user_b_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS direct_chat_messages (
    message_id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES direct_chat_sessions(session_id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tags (
    tag_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed roles
INSERT INTO roles (role_name, description)
VALUES
    ('L1 Support', 'Basic support engineer'),
    ('L2 Support', 'Advanced support engineer'),
    ('Manager', 'Team manager'),
    ('Admin', 'System administrator'),
    ('Consultant', 'Functional consultant'),
    ('Expert', 'Domain expert')
ON CONFLICT (role_name) DO NOTHING;

-- Seed a default tag if needed
INSERT INTO tags (name, description)
VALUES ('SAP', 'SAP related articles')
ON CONFLICT (name) DO NOTHING;

COMMIT;


SELECT * FROM tags;

SELECT * FROM expertise_tags;

SELECT
    tag_id,
    tag_name,
    description,
    status,
    approved_by,
    approved_at
FROM expertise_tags
ORDER BY tag_name ASC;

SELECT
    tr.request_id,
    tr.tag_name,
    tr.status,
    tr.requested_at,
    tr.deadline,
    u.user_id,
    u.name AS user_name,
    u.email AS user_email,
    u.department
FROM tag_requests tr
INNER JOIN users u
    ON tr.user_id = u.user_id
WHERE tr.status = 'pending'
ORDER BY tr.requested_at ASC;


SELECT
    u.user_id,
    u.name,
    u.email,
    u.department,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'tag_id', t.tag_id,
                'tag_name', t.tag_name
            )
        ) FILTER (WHERE t.tag_id IS NOT NULL),
        '[]'::json
    ) AS tags
FROM users u
LEFT JOIN user_tags ut
    ON u.user_id = ut.user_id
LEFT JOIN expertise_tags t
    ON ut.tag_id = t.tag_id
WHERE u.is_approved = true
GROUP BY
    u.user_id,
    u.name,
    u.email,
    u.department
ORDER BY u.name ASC;

SELECT embedding
FROM knowledge_articles;

SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'knowledge_articles'
ORDER BY ordinal_position;

SELECT
    table_name,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('knowledge_articles', 'articles')
ORDER BY table_name, ordinal_position;

ALTER TABLE knowledge_articles
ADD COLUMN embedded

ALTER TABLE article_sections
ADD COLUMN tags TEXT[] DEFAULT '{}';

ALTER TABLE support_requests
DROP CONSTRAINT support_requests_status_check;

ALTER TABLE support_requests
ADD CONSTRAINT support_requests_status_check
CHECK (status IN ('Pending', 'In Progress', 'Resolved', 'closed', 'escalated')
);

SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'support_requests'::regclass;

What the code writes:
UPDATE role_requests
SET status='rejected',
    rejection_message=$1     -- ← this column doesn't e
WHERE request_id=$2

SELECT er.request_id, er.status, u.name AS assigned_expert, u.email, r.role_name
FROM expert_requests er
JOIN users u ON er.expert_id = u.user_id
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE r.role_name IN ('Expert', 'Team Lead')
ORDER BY er.request_id DESC
LIMIT 5;

UPDATE support_requests
SET assigned_expert = NULL
WHERE status = 'pending';

SELECT
    request_id,
    status,
    assigned_expert
FROM support_requests
ORDER BY request_id DESC;
SELECT
    request_id,
    user_id,
    expert_id,
    status,
    query,
    module,
    created_at
FROM expert_requests
ORDER BY created_at DESC;

SELECT
    request_id,
    status,
    assigned_expert
FROM support_requests
ORDER BY request_id DESC;
SELECT
    er.*,
    u.name AS requester_name,
    u.email AS requester_email
FROM expert_requests er
LEFT JOIN users u
    ON u.user_id = er.user_id
WHERE er.status = $1
ORDER BY er.created_at DESC;

SELECT
    conname,
    pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'expert_requests_status_check';

SELECT
    request_id,
    status,
    assigned_expert
FROM support_requests
ORDER BY request_id DESC;
SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'expert_requests'
ORDER BY ordinal_position;

SELECT
    u.user_id,
    u.name,
    u.email,
    u.is_active,
    r.role_id,
    r.role_name
FROM users u
JOIN user_roles ur
    ON ur.user_id = u.user_id
JOIN roles r
    ON r.role_id = ur.role_id
WHERE LOWER(r.role_name) = 'admin';

SELECT *
FROM roles
ORDER BY role_id;

SELECT
    u.user_id,
    u.name,
    u.email,
    r.role_name
FROM users u
LEFT JOIN user_roles ur
    ON ur.user_id = u.user_id
LEFT JOIN roles r
    ON r.role_id = ur.role_id
WHERE u.email = 'admin@example.com';


SELECT *
FROM roles
WHERE LOWER(role_name) = 'admin';
INSERT INTO user_roles (user_id, role_id)
VALUES (1, 1)
ON CONFLICT DO NOTHING;

SELECT
    u.user_id,
    u.name,
    u.email,
    r.role_id,
    r.role_name
FROM users u
JOIN user_roles ur
    ON ur.user_id = u.user_id
JOIN roles r
    ON r.role_id = ur.role_id
WHERE u.user_id = 1;

SELECT
    u.user_id,
    u.name,
    u.email
FROM users u
JOIN user_roles ur
    ON ur.user_id = u.user_id
JOIN roles r
    ON ur.role_id = r.role_id
WHERE LOWER(r.role_name) = 'admin'
  AND u.user_id != 1
  AND u.is_active = TRUE
ORDER BY u.user_id
LIMIT 1;

SELECT er.request_id, er.status, er.created_at,
       u.name AS assigned_to, u.email, r.role_name
FROM expert_requests er
JOIN users u ON er.expert_id = u.user_id
LEFT JOIN user_roles ur ON u.user_id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.role_id
ORDER BY er.request_id DESC
LIMIT 3;

SELECT u.user_id, u.name, u.email, r.role_name
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE LOWER(r.role_name) = 'admin'
ORDER BY u.user_id;

SELECT u.user_id, u.name, u.email,
       STRING_AGG(r.role_name, ', ') AS roles
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE u.user_id IN (
    SELECT ur2.user_id FROM user_roles ur2
    JOIN roles r2 ON ur2.role_id = r2.role_id
    WHERE LOWER(r2.role_name) = 'admin'
)
GROUP BY u.user_id, u.name, u.email
ORDER BY u.user_id;

SELECT er.request_id, er.status, er.created_at,
       u.name AS assigned_to, u.email
FROM expert_requests er
JOIN users u ON er.expert_id = u.user_id
ORDER BY er.request_id DESC
LIMIT 1;

SELECT er.request_id, er.status, er.created_at,
       u.name AS assigned_to, u.email
FROM expert_requests er
JOIN users u ON er.expert_id = u.user_id
ORDER BY er.request_id DESC
LIMIT 1;

SELECT er.request_id, u.name AS assigned_to, u.email
FROM expert_requests er
JOIN users u ON er.expert_id = u.user_id
ORDER BY er.request_id DESC
LIMIT 1;

SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'expert_requests'::regclass AND contype = 'c';
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'expert_requests'::regclass AND contype = 'c';

CREATE TABLE IF NOT EXISTS chat_sessions (
    session_id  SERIAL PRIMARY KEY,
    request_id  INTEGER REFERENCES expert_requests(request_id) ON DELETE CASCADE,
    status      VARCHAR(30) DEFAULT 'active',
    started_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    message_id  SERIAL PRIMARY KEY,
    session_id  INTEGER REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    sender_id   INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    message     TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


SELECT
    u.user_id,
    u.name,
    u.email,
    STRING_AGG(r.rol e_name, ', ') AS all_roles,
    (SELECT COUNT(*) FROM user_roles ur2 WHERE ur2.user_id = u.user_id) AS role_count
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE u.user_id IN (
    SELECT ur3.user_id FROM user_roles ur3
    JOIN roles r3 ON ur3.role_id = r3.role_id
    WHERE LOWER(r3.role_name) = 'admin'
)
GROUP BY u.user_id, u.name, u.email
ORDER BY u.user_id;


SELECT er.request_id, er.status, er.created_at, u.name, u.email
FROM expert_requests er
JOIN users u ON er.expert_id = u.user_id
ORDER BY er.request_id DESC
LIMIT 1;


ALTER TABLE support_requests
ALTER COLUMN status SET DEFAULT 'open';

-- Also update any existing tickets currently stuck as "Pending":
UPDATE support_requests SET status = 'open' WHERE status = 'Pending';
SELECT request_id, title, status, requester_id, created_at
FROM support_requests
ORDER BY created_at DESC
LIMIT 10;

SELECT user_id, name, email FROM users WHERE email = '<the email you're currently logged in with>';

-- First see the current definition:
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'expert_requests'::regclass AND contype = 'c';


ALTER TABLE expert_requests
DROP CONSTRAINT expert_requests_status_check;
  
ALTER TABLE expert_requests
ADD CONSTRAINT expert_requests_status_check
CHECK (status IN ('pending', 'assigned', 'accepted', 'resolved', 'closed', 'escalated', 'rejected', 'expired', 'timeout'));

ALTER TABLE expert_requests
DROP CONSTRAINT expert_requests_status_check;

ALTER TABLE expert_requests
ADD CONSTRAINT expert_requests_status_check
CHECK (status IN ('pending', 'assigned', 'accepted', 'resolved', 'closed', 'escalated', 'rejected', 'expired', 'timeout'));

CREATE TABLE transitions (
    transition_id SERIAL PRIMARY KEY,

    from_user_id INTEGER
        REFERENCES users(user_id),

    to_user_id INTEGER
        REFERENCES users(user_id),

    sap_module VARCHAR(100),

    start_date DATE,

    target_completion_date DATE,

    overall_status VARCHAR(50)
        DEFAULT 'in_progress'
        CHECK (
            overall_status IN (
                'not_started',
                'in_progress',
                'completed',
                'blocked'
            )
        ),

    remarks TEXT,

    created_by INTEGER
        REFERENCES users(user_id),

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()
);


ALTER TABLE transition_tasks
ADD COLUMN IF NOT EXISTS transition_id INTEGER
REFERENCES transitions(transition_id)
ON DELETE CASCADE;


CREATE TABLE checklist_templates (
    template_id SERIAL PRIMARY KEY,

    phase_id INTEGER
        REFERENCES transition_phases(phase_id)
        ON DELETE CASCADE,

    checklist_item VARCHAR(500) NOT NULL,

    description TEXT,

    display_order INTEGER DEFAULT 1,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE transition_checklist (
    checklist_id SERIAL PRIMARY KEY,

    transition_id INTEGER
        REFERENCES transitions(transition_id)
        ON DELETE CASCADE,

    template_id INTEGER
        REFERENCES checklist_templates(template_id)
        ON DELETE CASCADE,

    status VARCHAR(50)
        DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'in_progress',
                'completed',
                'blocked'
            )
        ),

    remarks TEXT,

    completed_by INTEGER
        REFERENCES users(user_id),

    completed_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (transition_id, template_id)
);

COUNT(tt.task_id) AS total_tasks,

COUNT(
    CASE
        WHEN tt.status = 'completed' THEN 1
    END
) AS completed_tasks,

CASE
    WHEN COUNT(tt.task_id) = 0 THEN 0
    ELSE ROUND(
        COUNT(
            CASE
                WHEN tt.status = 'completed' THEN 1
            END
        ) * 100.0 / COUNT(tt.task_id)
    )
END AS completion_percentage

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'transitions'
ORDER BY ordinal_position;

INSERT INTO transitions
(user_id, title, status, progress, created_at, updated_at)
VALUES
(1, 'SAP Employee Transition', 'in_progress', 40, NOW(), NOW()),
(1, 'ABAP Knowledge Transition', 'in_progress', 70, NOW(), NOW()),
(1, 'Completed SAP Transition', 'completed', 100, NOW(), NOW());

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'transition_tasks'
ORDER BY ordinal_position;

INSERT INTO transition_tasks
(transition_id, title, status)
VALUES
(1, 'Collect SAP documents', 'completed'),
(1, 'Review ABAP documents', 'in_progress'),
(1, 'Complete knowledge transfer', 'pending');

SELECT column_name, data_type
FROM information_sc

ALTER TABLE transition_tasks
ADD COLUMN IF NOT EXISTS assigned_to INTEGER REFERENCES users(user_id),
ADD COLUMN IF NOT EXISTS due_date DATE,
-- ADD COLUMN IF NOT EXISTS depends_on_task_id INTEGER REFERENCES transition_tasks(task_id);
CREATE TABLE IF NOT EXISTS transition_attachments (
    attachment_id SERIAL PRIMARY KEY,
    transition_id INTEGER REFERENCES transitions(transition_id) ON DELETE CASCADE,
    file_name VARCHAR(500),
    file_path VARCHAR(500),
    file_type VARCHAR(100),
    uploaded_by INTEGER REFERENCES users(user_id),
    uploaded_at TIMESTAMP DEFAULT NOW()
);


Check current constraint first:
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'transition_tasks'::regclass AND contype = 'f';

ALTER TABLE transition_tasks
DROP CONSTRAINT transition_tasks_transition_id_fkey;

ALTER TABLE transition_tasks
ADD CONSTRAINT transition_tasks_transition_id_fkey
FOREIGN KEY (transition_id) REFERENCES transitions(transition_id) ON DELETE CASCADE;

SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'transition_checklist'::regclass AND contype = 'f';


ALTER TABLE transition_checklist
DROP CONSTRAINT transition_checklist_transition_id_fkey;

ALTER TABLE transition_checklist
ADD CONSTRAINT transition_checklist_transition_id_fkey
FOREIGN KEY (transition_id) REFERENCES transitions(transition_id) ON DELETE CASCADE;

ALTER TABLE expertise_tags
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

UPDATE expertise_tags
SET created_at = CURRENT_TIMESTAMP
WHERE created_at IS NULL;

ALTER TABLE expertise_tags
ADD COLUMN approved_at TIMESTAMP;

ALTER TABLE expertise_tags
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

1. Adds your 5 phases (safe to re-run, phase_name is UNIQUE)
INSERT INTO transition_phases (phase_name, phase_order, description) VALUES
    ('Discovery & Planning',   1, 'Scope the transition and plan the handover'),
    ('Knowledge Transfer',     2, 'Transfer documentation and process knowledge'),
    ('Training & Onboarding',  3, 'Train the new owner on day-to-day operations'),
    ('Readiness',              4, 'Validate the new owner is ready to take over'),
    ('Handover & Onboarding',  5, 'Formal sign-off and ownership transfer')
ON CONFLICT (phase_name) DO NOTHING;

-- 2. Creates the missing table
CREATE TABLE IF NOT EXISTS checklist_templates (
    template_id     SERIAL PRIMARY KEY,
    phase_id        INTEGER NOT NULL REFERENCES transition_phases(phase_id),
    checklist_item  VARCHAR(255) NOT NULL,
    description     TEXT,
    display_order   INTEGER NOT NULL DEFAULT 0
);

-- -- 3. Seeds 3 checklist items per phase (full list in the file above)

SELECT ct.template_id, tp.phase_name, ct.checklist_item, ct.display_order
FROM checklist_templates ct
JOIN transition_phases tp ON tp.phase_id = ct.phase_id
ORDER BY tp.phase_order, ct.display_order;