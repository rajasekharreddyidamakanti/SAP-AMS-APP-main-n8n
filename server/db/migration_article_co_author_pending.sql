BEGIN;

ALTER TABLE knowledge_articles
DROP CONSTRAINT IF EXISTS knowledge_articles_status_check;

ALTER TABLE knowledge_articles
ADD CONSTRAINT knowledge_articles_status_check
CHECK (status IN ('draft', 'under_review', 'co_author_pending', 'published', 'rejected'));

COMMIT;
