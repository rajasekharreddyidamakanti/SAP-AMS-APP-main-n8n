-- Run once against an existing database to support section tags.
ALTER TABLE article_sections
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';