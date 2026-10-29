cd "C:\Users\IT-Admin\Downloads\SAP\SAP-AMS-APP-main\server"
npm run embeddingcd "C:\Users\IT-Admin\Downloads\SAP\SAP-AMS-APP-main\server"
npm run embeddingCREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
        CHECK (role IN ('admin', 'analyst', 'manager', 'viewer')),
    department VARCHAR(100),
    phone_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    is_approved BOOLEAN DEFAULT TRUE,
    approval_status VARCHAR(30) DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE knowledge_articles (
    article_id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    module TEXT,
    severity VARCHAR(50)
        CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    status VARCHAR(50)
        DEFAULT 'draft'
        CHECK (status IN ('draft', 'under_review', 'co_author_pending', 'published', 'rejected')),
    tags TEXT[],
    embedding JSONB,
    created_by INTEGER REFERENCES users(user_id),
    approved_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE related_articles (
    article_id INTEGER REFERENCES knowledge_articles(article_id)
        ON DELETE CASCADE,

    related_id INTEGER REFERENCES knowledge_articles(article_id)
        ON DELETE CASCADE,

    PRIMARY KEY (article_id, related_id)
);

CREATE TABLE transition_phases (
    phase_id SERIAL PRIMARY KEY,
    phase_name VARCHAR(100) UNIQUE NOT NULL,
    phase_order INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE transition_tasks (
    task_id SERIAL PRIMARY KEY,

    title VARCHAR(500) NOT NULL,

    description TEXT,

    phase_id INTEGER
        REFERENCES transition_phases(phase_id),

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

    due_date DATE,

    assigned_to INTEGER
        REFERENCES users(user_id),

    completed_at TIMESTAMP,

    signed_off_by INTEGER
        REFERENCES users(user_id),

    sign_off_notes TEXT,

    depends_on_task_id INTEGER
        REFERENCES transition_tasks(task_id)
        ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE task_dependencies (
    task_id INTEGER
        REFERENCES transition_tasks(task_id)
        ON DELETE CASCADE,

    depends_on_id INTEGER
        REFERENCES transition_tasks(task_id)
        ON DELETE CASCADE,

    PRIMARY KEY (task_id, depends_on_id)
);

CREATE TABLE checklist_templates (
    template_id SERIAL PRIMARY KEY,
    phase_id INTEGER NOT NULL REFERENCES transition_phases(phase_id) ON DELETE CASCADE,
    checklist_item VARCHAR(500) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE transition_checklist (
    checklist_id SERIAL PRIMARY KEY,
    transition_id INTEGER NOT NULL REFERENCES transitions(transition_id) ON DELETE CASCADE,
    template_id INTEGER NOT NULL REFERENCES checklist_templates(template_id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    remarks TEXT,
    completed_by INTEGER REFERENCES users(user_id),
    completed_at TIMESTAMP,
    UNIQUE (transition_id, template_id)
);

CREATE TABLE transition_task_attachments (
    attachment_id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES transition_tasks(task_id) ON DELETE CASCADE,
    file_name VARCHAR(500) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(255),
    uploaded_by INTEGER REFERENCES users(user_id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE onboarding_members (
    member_id SERIAL PRIMARY KEY,

    user_id INTEGER
        REFERENCES users(user_id),

    role_assigned VARCHAR(255),

    start_date DATE,

    target_completion_date DATE,

    overall_status VARCHAR(50)
        DEFAULT 'in_progress'
        CHECK (
            overall_status IN (
                'not_started',
                'in_progress',
                'certified'
            )
        ),

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE training_modules (
    module_id SERIAL PRIMARY KEY,

    title VARCHAR(500) NOT NULL,

    description TEXT,

    sap_module VARCHAR(100),

    is_required BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE training_assignments (
    assignment_id SERIAL PRIMARY KEY,

    member_id INTEGER
        REFERENCES onboarding_members(member_id)
        ON DELETE CASCADE,

    module_id INTEGER
        REFERENCES training_modules(module_id),

    status VARCHAR(50)
        DEFAULT 'not_started'
        CHECK (
            status IN (
                'not_started',
                'in_progress',
                'completed'
            )
        ),

    completed_at TIMESTAMP,

    notes TEXT
);

CREATE TABLE key_contacts (
    contact_id SERIAL PRIMARY KEY,

    user_id INTEGER
        REFERENCES users(user_id),

    name VARCHAR(255) NOT NULL,

    email VARCHAR(255),

    phone VARCHAR(50),

    role VARCHAR(255),

    sap_module VARCHAR(100),

    escalation_level INTEGER
        CHECK (escalation_level IN (1, 2, 3)),

    is_on_call BOOLEAN DEFAULT FALSE,

    on_call_start TIME,

    on_call_end TIME,

    notes TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX key_contacts_user_id_key
    ON key_contacts (user_id)
    WHERE user_id IS NOT NULL;

CREATE TABLE escalation_paths (
    path_id SERIAL PRIMARY KEY,

    sap_module VARCHAR(100) NOT NULL UNIQUE,

    level_1_contact INTEGER
        REFERENCES key_contacts(contact_id),

    level_2_contact INTEGER
        REFERENCES key_contacts(contact_id),

    level_3_contact INTEGER
        REFERENCES key_contacts(contact_id),

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE expertise_tags (
    tag_id SERIAL PRIMARY KEY,
    tag_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE user_tags (
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    tag_id INT REFERENCES expertise_tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, tag_id)
);

ALTER TABLE knowledge_articles
ADD COLUMN summary TEXT;

CREATE TABLE support_requests (
    request_id SERIAL PRIMARY KEY,
    requester_id INT REFERENCES users(user_id),
    expert_id INT REFERENCES users(user_id),
    tag_id INT REFERENCES expertise_tags(tag_id),
    title VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE TABLE chat_messages (
    message_id SERIAL PRIMARY KEY,
    request_id INT REFERENCES support_requests(request_id),
    sender_id INT REFERENCES users(user_id),
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    type VARCHAR(100),
    title VARCHAR(255),
    message TEXT,
    reference_type VARCHAR(100),
    reference_id INTEGER,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_query_history (
    query_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    question TEXT,
    response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE article_attachments (
    attachment_id SERIAL PRIMARY KEY,

    article_id INTEGER NOT NULL
        REFERENCES knowledge_articles(article_id)
        ON DELETE CASCADE,

    file_name VARCHAR(255) NOT NULL,

    file_path TEXT NOT NULL,

    file_type VARCHAR(100),

    uploaded_by INTEGER
        REFERENCES users(user_id),

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expert_requests (
    request_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    expert_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    module VARCHAR(255),
    article_id INTEGER REFERENCES knowledge_articles(article_id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'pending'
        CHECK (status IN ('pending', 'assigned', 'accepted', 'resolved', 'closed', 'escalated', 'rejected', 'expired', 'timeout')),
    deadline TIMESTAMP,
    timeout_processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP
);

ALTER TABLE knowledge_articles
ALTER COLUMN content DROP NOT NULL;

ALTER TABLE knowledge_articles
ALTER COLUMN summary DROP NOT NULL;

ALTER TABLE knowledge_articles
DROP CONSTRAINT IF EXISTS knowledge_articles_status_check;

UPDATE knowledge_articles
SET status = CASE LOWER(TRIM(COALESCE(status, 'draft')))
    WHEN 'published' THEN 'published'
    WHEN 'approved' THEN 'published'
    WHEN 'under_review' THEN 'under_review'
    WHEN 'under review' THEN 'under_review'
    WHEN 'pending' THEN 'under_review'
    WHEN 'co_author_pending' THEN 'co_author_pending'
    WHEN 'rejected' THEN 'rejected'
    WHEN 'draft' THEN 'draft'
    ELSE 'draft'
END;

ALTER TABLE knowledge_articles
ADD CONSTRAINT knowledge_articles_status_check
CHECK (status IN ('draft', 'under_review', 'co_author_pending', 'published', 'rejected'));

ALTER TABLE knowledge_articles
DROP CONSTRAINT IF EXISTS knowledge_articles_severity_check;

ALTER TABLE knowledge_articles
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

CREATE TABLE IF NOT EXISTS article_edit_history (
    history_id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL
        REFERENCES knowledge_articles(article_id)
        ON DELETE CASCADE,
    edited_by INTEGER
        REFERENCES users(user_id),
    changes JSONB NOT NULL,
    edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

ALTER TABLE knowledge_articles
ADD COLUMN IF NOT EXISTS visibility_role VARCHAR(50)
DEFAULT 'employee';

ALTER TABLE knowledge_articles
ADD COLUMN IF NOT EXISTS department VARCHAR(50);

UPDATE knowledge_articles
SET visibility_role = 'employee'
WHERE visibility_role IS NULL;

UPDATE knowledge_articles
SET department = module
WHERE department IS NULL;

INSERT INTO roles (role_name, description)
VALUES
('L1 Support','Basic support engineer'),
('L2 Support','Advanced support engineer'),
('Manager','Team manager'),
('Admin','System administrator'),
('Consultant','Functional consultant')
ON CONFLICT (role_name) DO NOTHING;

CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER REFERENCES users(user_id),
    role_id INTEGER REFERENCES roles(role_id),
    PRIMARY KEY(user_id, role_id)
);

CREATE TABLE IF NOT EXISTS article_access (
    article_id INTEGER REFERENCES knowledge_articles(article_id),
    role_id INTEGER REFERENCES roles(role_id),
    PRIMARY KEY(article_id, role_id)
);



-- new updates







ALTER TABLE users
DROP COLUMN IF EXISTS role;

/* ===========================================================
   NEW CHANGES : ROLE BASED ACCESS CONTROL (RBAC)
   Added after initial database design.
   =========================================================== */


/* -----------------------------------------------------------
   1. Multiple roles per user
   One user can have multiple company roles.
   Example:
   Kanan → Admin + Manager
   Rahul → L2 Support + Expert
------------------------------------------------------------ */

CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

INSERT INTO roles (role_name, description)
VALUES
('L1 Support','Basic support engineer'),
('L2 Support','Advanced support engineer'),
('Manager','Team manager'),
('Admin','System administrator'),
('Consultant','Functional consultant'),
('Expert','Domain expert')
ON CONFLICT (role_name) DO NOTHING;


CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER REFERENCES users(user_id)
        ON DELETE CASCADE,

    role_id INTEGER REFERENCES roles(role_id)
        ON DELETE CASCADE,

    PRIMARY KEY(user_id, role_id)
);


/* -----------------------------------------------------------
   2. Article level access control
   Controls which roles can view articles.
------------------------------------------------------------ */

CREATE TABLE IF NOT EXISTS article_access (
    article_id INTEGER
        REFERENCES knowledge_articles(article_id)
        ON DELETE CASCADE,

    role_id INTEGER
        REFERENCES roles(role_id)
        ON DELETE CASCADE,

    PRIMARY KEY(article_id, role_id)
);


/* -----------------------------------------------------------
   3. Article visibility department
------------------------------------------------------------ */

ALTER TABLE knowledge_articles
ADD COLUMN IF NOT EXISTS visibility_role VARCHAR(100);

ALTER TABLE knowledge_articles
ADD COLUMN IF NOT EXISTS department VARCHAR(100);


/* -----------------------------------------------------------
   4. Existing article migration
------------------------------------------------------------ */

UPDATE knowledge_articles
SET department = module
WHERE department IS NULL;

UPDATE knowledge_articles
SET visibility_role = 'employee'
WHERE visibility_role IS NULL;


/* -----------------------------------------------------------
   5. Remove old single-role system
------------------------------------------------------------ */

ALTER TABLE users
DROP COLUMN IF EXISTS role;



-- 26/6 updations

DROP TABLE IF EXISTS article_access;

CREATE TABLE role_requests (
    request_id SERIAL PRIMARY KEY,

    user_id INTEGER
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    role_id INTEGER
        REFERENCES roles(role_id),

    status VARCHAR(30)
        DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'approved',
                'rejected',
                'expired'
            )
        ),

    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    approved_by INTEGER
        REFERENCES users(user_id),

    approved_at TIMESTAMP,

    deadline TIMESTAMP,

    remarks TEXT
);

CREATE TABLE tag_requests (
    request_id SERIAL PRIMARY KEY,

    user_id INTEGER
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    tag_name VARCHAR(255) NOT NULL,

    description TEXT,

    status VARCHAR(30)
        DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'approved',
                'rejected',
                'expired'
            )
        ),

    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    approved_by INTEGER
        REFERENCES users(user_id),

    approved_at TIMESTAMP,

    deadline TIMESTAMP
);

CREATE TABLE role_tags (
    role_id INTEGER
        REFERENCES roles(role_id)
        ON DELETE CASCADE,

    tag_id INTEGER
        REFERENCES expertise_tags(tag_id)
        ON DELETE CASCADE,

    PRIMARY KEY (role_id, tag_id)
);

CREATE TABLE article_contributors (
    article_id INTEGER
        REFERENCES knowledge_articles(article_id)
        ON DELETE CASCADE,

    user_id INTEGER
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    contribution_type VARCHAR(100),

    PRIMARY KEY(article_id, user_id)
);

CREATE TABLE article_sections (
    section_id SERIAL PRIMARY KEY,

    article_id INTEGER
        REFERENCES knowledge_articles(article_id)
        ON DELETE CASCADE,

    title VARCHAR(255),

    content TEXT,

    section_order INTEGER
);

CREATE TABLE section_contributors (
    section_id INTEGER
        REFERENCES article_sections(section_id)
        ON DELETE CASCADE,

    user_id INTEGER
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    PRIMARY KEY(section_id, user_id)
);

CREATE TABLE section_tags (
    section_id INTEGER
        REFERENCES article_sections(section_id)
        ON DELETE CASCADE,

    tag_id INTEGER
        REFERENCES expertise_tags(tag_id)
        ON DELETE CASCADE,

    PRIMARY KEY(section_id, tag_id)
);

CREATE TABLE article_tags (
    article_id INTEGER
        REFERENCES knowledge_articles(article_id)
        ON DELETE CASCADE,

    tag_id INTEGER
        REFERENCES expertise_tags(tag_id)
        ON DELETE CASCADE,

    PRIMARY KEY(article_id, tag_id)
);

ALTER TABLE support_requests
ADD COLUMN deadline TIMESTAMP;

ALTER TABLE support_requests
ADD COLUMN escalated BOOLEAN DEFAULT FALSE;

ALTER TABLE support_requests
ADD COLUMN priority VARCHAR(30);

ALTER TABLE support_requests
ADD COLUMN notify_all BOOLEAN DEFAULT FALSE;

CREATE TABLE request_contributors (
    request_id INTEGER
        REFERENCES support_requests(request_id)
        ON DELETE CASCADE,

    user_id INTEGER
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    PRIMARY KEY(request_id, user_id)
);

DROP TABLE article_contributors;

DROP TABLE section_contributors;

CREATE TABLE attachment_tags (
    attachment_id INTEGER
        REFERENCES article_attachments(attachment_id)
        ON DELETE CASCADE,

    tag_id INTEGER
        REFERENCES expertise_tags(tag_id)
        ON DELETE CASCADE,

    PRIMARY KEY(attachment_id, tag_id)
);

ALTER TABLE support_requests
DROP COLUMN expert_id;

CREATE TABLE request_users (
    request_id INTEGER
        REFERENCES support_requests(request_id)
        ON DELETE CASCADE,

    user_id INTEGER
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    PRIMARY KEY(request_id, user_id)
);

ALTER TABLE expertise_tags
ADD COLUMN description TEXT;

ALTER TABLE expertise_tags
ADD COLUMN status VARCHAR(30)
DEFAULT 'pending';

ALTER TABLE expertise_tags
ADD COLUMN approved_by INTEGER
REFERENCES users(user_id);

ALTER TABLE expertise_tags
ADD COLUMN approved_at TIMESTAMP;

DROP TABLE request_contributors;

ALTER TABLE transition_tasks
ADD COLUMN IF NOT EXISTS transition_id INTEGER
    REFERENCES transitions(transition_id)
    ON DELETE CASCADE;