# Progress and Verification

## Verified from the repository

- React client and Express API are separate applications in `client/` and
  `server/`.
- Client routes are declared in `client/src/App.jsx`.
- The server mounts feature route groups under `/api` from
  `server/routes/index.js`.
- PostgreSQL access is configured through the server environment and shared
  `pg` pool.
- Client navigation includes knowledge, support, chat/notifications,
  transition, certification/contact, admin, AI search, and ResumeIQ areas.
- Backend routes also cover additional onboarding, training, provisioning, and
  readiness workflows.
- The checked-in SQL now allows `co_author_pending` and defines the article
  `module` column as `TEXT`.
- The configured local PostgreSQL database was verified to have
  `knowledge_articles.module` of type `text` after applying the module-width
  fix.

## Not verified

- Multi-project transition plans and a dashboard to edit them are a new
  requirement; no implementation has been verified.
- Project-to-plan data relationships, project access rules, dashboard
  measures, and edit permissions for this feature are not yet defined.
- A full clean database initialization from an empty PostgreSQL database.
- A canonical, complete migration order for all SQL files under `server/db/`.
- Whether every API-only workflow is enabled and reachable in the UI.
- Production hosting, deployment, backup, monitoring, and scaling configuration.
- Production security posture, permission matrix, and operational service levels.
- Full automated test suite or production build status as of this memory-bank
  review.

## Useful validation commands

Run commands from the correct application directory:

```powershell
cd client
npm test -- --watchAll=false
npm run build
```

```powershell
cd server
npm start
```

The server manifest does not define a test script. Validate database migrations
against a disposable or explicitly selected database before applying them to a
shared or production environment.

## Update this file when

- A significant feature or workflow is completed or removed.
- Multi-project transition planning is designed, implemented, or its scope is
  clarified.
- A migration is applied or the schema's verified state changes.
- A build/test command is run and its result is relevant to future work.
- A known deployment or configuration caveat is resolved.
