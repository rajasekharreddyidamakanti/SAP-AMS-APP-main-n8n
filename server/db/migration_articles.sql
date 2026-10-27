-- Run once against an existing database to support article rejection.
BEGIN;

ALTER TABLE knowledge_articles
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE knowledge_articles
DROP CONSTRAINT IF EXISTS knowledge_articles_status_check;

-- Normalize legacy values before restoring the stricter status constraint.
UPDATE knowledge_articles
SET status = CASE LOWER(TRIM(COALESCE(status, 'draft')))
    WHEN 'published' THEN 'published'
    WHEN 'approved' THEN 'published'
    WHEN 'under_review' THEN 'under_review'
    WHEN 'under review' THEN 'under_review'
    WHEN 'pending' THEN 'under_review'
    WHEN 'rejected' THEN 'rejected'
    WHEN 'draft' THEN 'draft'
    ELSE 'draft'
END;

ALTER TABLE knowledge_articles
ADD CONSTRAINT knowledge_articles_status_check
CHECK (status IN ('draft', 'under_review', 'published', 'rejected'));

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

COMMIT;
