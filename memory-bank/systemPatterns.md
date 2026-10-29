# System Patterns

## High-level architecture

```text
Browser
  -> React client
  -> Express API (/api)
  -> route -> validator/middleware -> controller -> service -> repository
  -> PostgreSQL and configured integrations
```

The actual implementation is in `client/` and `server/`. The server starts
from `server/index.js`, loads environment configuration, mounts routes, serves
uploaded files from the configured upload directory, and installs error
middleware.

## Frontend patterns

- React application with route declarations in `client/src/App.jsx`.
- React Router handles navigation; most application pages are wrapped in
  `ProtectedRoute` and the shared sidebar/topbar layout.
- Authentication state is managed by `client/src/context/AuthContext.jsx`.
- API requests are grouped into modules in `client/src/api/`.
- The existing API modules use Axios and attach a JWT from browser
  `localStorage`.
- UI components primarily use Material UI.

**Configuration caveat:** inspected API modules currently use the literal
`http://localhost:3001/api` base URL. A frontend API-origin environment
variable was not verified. Account for this before deploying the client to a
different origin.

## Backend patterns

- Express app entry: `server/index.js`.
- Route registration: `server/routes/index.js`; feature groups are mounted
  beneath `/api`.
- Authentication middleware verifies a JWT and places user identity and roles
  on the request.
- Article routes demonstrate validation middleware followed by controller and
  service/repository logic.
- PostgreSQL access is provided by the shared pool in `server/config/db.js`.
- Shared error middleware is installed after the routes. Some controllers also
  map caught errors to HTTP responses directly.

Use the existing feature's route/controller/service/repository patterns when
adding server behavior. Check for an existing helper or service before
duplicating logic.

## Data and files

- PostgreSQL is the primary relational database.
- The checked-in schema includes users, knowledge articles, transition tasks
  and phases, support requests, roles, and additional workflow tables.
- For the requested multi-project transition-planning enhancement, the data
  model and API should scope plans and their related work to a stable project
  identifier. Do not rely on a client-only project filter for isolation.
  Confirm whether existing transition records can be extended or need a
  project entity/relationship before writing migrations.
- Article content uses status, visibility, classification, tags, and optional
  relationships to users; schema files and migrations should be treated as
  authoritative only after confirming they match the target database.
- Upload handling is served from the configured upload path. Do not commit
  uploaded documents or user data as examples.
- Document-related dependencies include Mammoth, OfficeParser, PDF parsing,
  and Tesseract.js; confirm a particular processing path in the owning service
  before relying on it.

## AI integrations

The server includes Google GenAI dependencies and services for AI-related
features. Keys and model selection are environment-dependent. Do not log or
document API credentials. AI calls may require external network access and
valid provider configuration.

## Data-flow and security reminders

- Protect API routes on the server; hiding a page or menu item in React is not
  authorization.
- Validate and normalize client input at the API boundary.
- Use parameterized SQL for database operations.
- Keep secrets in environment configuration, not source or memory-bank files.
- Treat uploaded files and generated AI output as untrusted input.
- For multi-project plan updates, validate project access on the server and
  ensure updates cannot affect records belonging to another project.
