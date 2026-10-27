-- Run once against an existing database to support custom transition tasks.
ALTER TABLE transition_tasks
ADD COLUMN IF NOT EXISTS transition_id INTEGER
    REFERENCES transitions(transition_id)
    ON DELETE CASCADE;

ALTER TABLE transition_tasks
ADD COLUMN IF NOT EXISTS depends_on_task_id INTEGER
    REFERENCES transition_tasks(task_id)
    ON DELETE SET NULL;

INSERT INTO transition_phases (phase_name, phase_order)
VALUES
    ('Discovery & Planning', 1),
    ('Knowledge Transfer', 2),
    ('Training & Onboarding', 3),
    ('Validation', 4),
    ('Readiness', 5),
    ('Closure', 6),
    ('Handover & Onboarding', 7)
ON CONFLICT (phase_name) DO NOTHING;

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

INSERT INTO checklist_templates (phase_id, checklist_item, description, display_order)
SELECT p.phase_id, v.checklist_item, v.description, v.display_order
FROM transition_phases p
JOIN (
    VALUES
        ('Discovery & Planning', 'Identify Transition Scope', 'Define systems, processes, responsibilities, and stakeholders in scope.', 1),
        ('Discovery & Planning', 'Create Transition Plan', 'Document timeline, milestones, owners, risks, and dependencies.', 2),
        ('Discovery & Planning', 'Assess Risks & Dependencies', 'Identify risks and dependencies that could impact the transition.', 3),
        ('Knowledge Transfer', 'Share Project Documents', 'Provide access to relevant documents, wikis, and runbooks.', 1),
        ('Knowledge Transfer', 'Knowledge Transfer Sessions', 'Walk through key processes and systems with the new owner.', 2),
        ('Knowledge Transfer', 'Review Historical Issues', 'Discuss past incidents and how they were resolved.', 3),
        ('Training & Onboarding', 'Provide System Access', 'Set up accounts, credentials, and tool access for the new owner.', 1),
        ('Training & Onboarding', 'Conduct Onboarding Training', 'Complete required training and onboarding activities.', 2),
        ('Readiness', 'Readiness Assessment', 'Evaluate the new owner''s confidence and competence.', 1),
        ('Readiness', 'Address Open Gaps', 'Resolve outstanding knowledge or access gaps.', 2),
        ('Closure', 'Final Sign-off', 'Formal confirmation that the handover is complete.', 1),
        ('Handover & Onboarding', 'Transfer Ownership', 'Update ownership records and notify stakeholders.', 1),
        ('Handover & Onboarding', 'Post-Handover Support', 'Agree on a support window for follow-up questions.', 2)
) AS v(phase_name, checklist_item, description, display_order)
    ON v.phase_name = p.phase_name
WHERE NOT EXISTS (
    SELECT 1
    FROM checklist_templates existing
    WHERE existing.phase_id = p.phase_id
      AND existing.checklist_item = v.checklist_item
);

-- Move checklist items into the real task table, preserving completion state.
INSERT INTO transition_tasks
    (transition_id, title, description, phase_id, status, assigned_to, due_date, completed_at, signed_off_by, sign_off_notes)
SELECT
    tc.transition_id,
    ct.checklist_item,
    ct.description,
    ct.phase_id,
    CASE WHEN tc.status = 'completed' THEN 'completed' ELSE 'pending' END,
    t.to_user_id,
    t.target_completion_date,
    tc.completed_at,
    tc.completed_by,
    tc.remarks
FROM transition_checklist tc
JOIN checklist_templates ct ON ct.template_id = tc.template_id
JOIN transitions t ON t.transition_id = tc.transition_id
WHERE NOT EXISTS (
    SELECT 1
    FROM transition_tasks existing
    WHERE existing.transition_id = tc.transition_id
      AND existing.title = ct.checklist_item
);

-- Remove the original eight hardcoded task names after their replacements exist.
DELETE FROM transition_tasks
WHERE title IN (
    'Create Transition Plan', 'Share Project Documents',
    'Knowledge Transfer Sessions', 'Code Walkthrough',
    'Application Demo', 'Shadow Support', 'Reverse Shadow',
    'Final Sign Off'
)
AND task_id NOT IN (
    SELECT MIN(task_id)
    FROM transition_tasks
    GROUP BY transition_id, title
);

-- Checklist tables remain for backward compatibility, but no longer drive the UI.
DELETE FROM transition_checklist;

-- Contact registry safeguards and escalation-path upsert support.
-- Keep the oldest contact row for each linked user and repoint escalation
-- paths before creating the one-contact-per-user index.
UPDATE escalation_paths ep
SET level_1_contact = keeper.contact_id
FROM key_contacts duplicate_contact
JOIN (
    SELECT user_id, MIN(contact_id) AS contact_id
    FROM key_contacts
    WHERE user_id IS NOT NULL
    GROUP BY user_id
) keeper ON keeper.user_id = duplicate_contact.user_id
WHERE duplicate_contact.contact_id <> keeper.contact_id
  AND ep.level_1_contact = duplicate_contact.contact_id;

UPDATE escalation_paths ep
SET level_2_contact = keeper.contact_id
FROM key_contacts duplicate_contact
JOIN (
    SELECT user_id, MIN(contact_id) AS contact_id
    FROM key_contacts
    WHERE user_id IS NOT NULL
    GROUP BY user_id
) keeper ON keeper.user_id = duplicate_contact.user_id
WHERE duplicate_contact.contact_id <> keeper.contact_id
  AND ep.level_2_contact = duplicate_contact.contact_id;

UPDATE escalation_paths ep
SET level_3_contact = keeper.contact_id
FROM key_contacts duplicate_contact
JOIN (
    SELECT user_id, MIN(contact_id) AS contact_id
    FROM key_contacts
    WHERE user_id IS NOT NULL
    GROUP BY user_id
) keeper ON keeper.user_id = duplicate_contact.user_id
WHERE duplicate_contact.contact_id <> keeper.contact_id
  AND ep.level_3_contact = duplicate_contact.contact_id;

DELETE FROM key_contacts duplicate_contact
USING key_contacts keeper
WHERE duplicate_contact.user_id IS NOT NULL
  AND duplicate_contact.user_id = keeper.user_id
  AND duplicate_contact.contact_id > keeper.contact_id;

DELETE FROM escalation_paths older
USING escalation_paths newer
WHERE older.sap_module = newer.sap_module
  AND older.path_id < newer.path_id;
CREATE UNIQUE INDEX IF NOT EXISTS escalation_paths_sap_module_key
    ON escalation_paths (sap_module);

CREATE UNIQUE INDEX IF NOT EXISTS key_contacts_user_id_key
    ON key_contacts (user_id)
    WHERE user_id IS NOT NULL;
