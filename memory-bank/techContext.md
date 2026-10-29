# Technical Context

## Stack

| Component | Technology |
|---|---|
| Frontend | React 19, React Router 6, Material UI 5 |
| Frontend tooling | Create React App / `react-scripts` 5 |
| HTTP client | Axios |
| Backend | Node.js, Express 5 (CommonJS) |
| Database | PostgreSQL via `pg` |
| Authentication | JSON Web Tokens; bcrypt/bcryptjs dependencies |
| AI | Google GenAI SDK |
| Other backend dependencies | Multer, Mammoth, OfficeParser, PDF parsing, Tesseract.js, Nodemailer, node-cron |

Versions above are derived from the package manifests and may change; recheck
`client/package.json` and `server/package.json` when updating this page.

## Repository layout

```text
client/
  src/
    api/          Axios API modules
    components/   Shared UI components
    context/      Application state providers
    pages/        Screen-level React components
    utils/        Client utilities
server/
  config/         Environment, database, JWT, and app configuration
  controllers/    HTTP request handlers
  db/             Schema and SQL migrations
  middleware/     Authentication, validation, and error handling
  repositories/   Database queries
  routes/         Express route definitions
  services/       Feature/business logic
  uploads/        Runtime upload storage; do not treat as source fixtures
  docs/           Backend API and architecture notes
memory-bank/      Maintained project context
```

## Local development

Install dependencies separately:

```powershell
cd server
npm install
```

```powershell
cd client
npm install
```

Create `server/.env` from `server/.env.example`, then configure valid database,
JWT, and optional provider settings. Start the server and client in separate
terminals:

```powershell
cd server
npm run dev
```

```powershell
cd client
npm start
```

The example defaults are frontend `http://localhost:3000`, backend port `3001`,
and PostgreSQL port `5432`. Client API modules inspected use
`http://localhost:3001/api`.

## Available scripts

### `server/`

- `npm start` — run `node index.js`
- `npm run dev` — run `nodemon index.js`
- `npm run embedding` — generate embeddings for published articles without
  embeddings

### `client/`

- `npm start` — run the development server
- `npm test` — run Create React App tests
- `npm run build` — produce a production build

## Environment configuration

`server/config/env.js` reads `server/.env` and exposes settings for:

- `NODE_ENV`, `PORT`, `CLIENT_URL`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `UPLOAD_PATH`, `MAX_FILE_SIZE`
- `LLM_API`, `LLM_MODEL`
- `EMAIL_API`, `NOTIFICATION_API`, `LOG_LEVEL`

`server/.env.example` additionally documents `GEMINI_API_KEY`,
`GEMINI_EMBEDDING_MODEL`, and optional SMTP variables. Check provider code
before assuming every example variable is read through the same configuration
path. Never copy real `.env` values into documentation.

## Database setup cautions

- PostgreSQL must be reachable using the server environment configuration.
- SQL files are located under `server/db/`; the correct complete initialization
  and migration order is not documented in one authoritative runner.
- Review migrations against the target database before applying them.
- Recent article fixes changed the checked-in schema to allow the
  `co_author_pending` status and made the article `module` column `TEXT`.
- `server/db/migration_article_co_author_pending.sql` and
  `server/db/migration_article_module_length.sql` apply those changes to
  existing databases. Verify they are applied to each relevant environment.
