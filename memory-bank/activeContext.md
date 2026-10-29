# Active Context

## Last reviewed

2026-10-29

## New product request

- Expand transition planning to cover multiple projects.
- Add a project transition-plan dashboard that lets users view, update, and
  edit a selected project's plan.
- This is a requested feature only; implementation, schema, API, UX, and
  authorization changes have not yet been made or verified.
- Before implementation, inspect the existing transition schema and workflow
  and define project identity, plan fields, user access, and cross-project
  summary needs.

## Recent work

- Investigated article creation failures reported in the UI.
- Added `co_author_pending` to the checked-in article status constraints and
  created `server/db/migration_article_co_author_pending.sql`.
- Expanded the checked-in article `module` column to `TEXT` and created
  `server/db/migration_article_module_length.sql`.
- Applied the module column change to the PostgreSQL database configured by
  `server/.env` during the prior session and verified the column type is
  `text`.

## Current caveats

- The co-author status migration was added to the repository; its application
  to every database environment has not been verified.
- The article-module change was verified against the database reachable from
  this local server configuration. Other databases/environments still need the
  module migration.
- Client API modules inspected contain a hardcoded local API URL; deployment
  configuration for a different API origin requires review.
- Database schema files contain overlapping setup and migration SQL. Confirm
  the target database state and migration order before running broad schema
  scripts.
- No production deployment architecture or production readiness sign-off was
  verified.

## Working agreements

- Preserve unrelated and existing work; make focused changes.
- Read the feature's current implementation and SQL schema before changing
  behavior.
- Keep documentation aligned with the implementation and distinguish verified
  behavior from assumptions.
- Run the smallest relevant test/build after code changes. Database changes
  require checking the intended database and confirming the resulting schema.
- Do not expose secrets, customer data, or uploaded records in logs, examples,
  or documentation.
