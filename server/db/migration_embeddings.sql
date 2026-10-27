-- Run once against an existing database to support AI article search.
ALTER TABLE knowledge_articles
ADD COLUMN IF NOT EXISTS embedding JSONB;