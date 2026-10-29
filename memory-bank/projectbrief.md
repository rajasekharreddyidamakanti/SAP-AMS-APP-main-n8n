# Project Brief

## Product

**SAP AMS Knowledge & Transition Platform** is a web application that brings
operational knowledge, support workflows, transition coordination, and
AI-assisted tools into one authenticated workspace.

The product direction includes supporting transition planning across multiple
projects, with a dashboard to view and edit each project's transition plan.
This is a requested enhancement, not a feature confirmed as implemented.

The codebase is located in `client/` and `server/`. The backend exposes
feature-oriented Express routes under `/api`; the React frontend consumes those
routes.

## Goals

- Make operational articles easier to create, review, organize, and find.
- Provide users with screens for support requests and expert assistance.
- Support communication through chat and notifications.
- Help teams coordinate transition work, tasks, onboarding, training, and
  readiness.
- Support distinct transition plans for multiple projects and provide a
  project-level dashboard for reviewing and editing those plans.
- Provide administrative screens for managing users and shared platform
  structures.
- Offer optional AI-assisted search, article review, an in-app assistant, and
  resume-to-role analysis.

These are product intents inferred from screens, routes, and services. No
measured business outcomes or service-level commitments are documented here.

## Main capability areas

| Area | Examples in the codebase |
|---|---|
| Knowledge | Articles, authoring, review, tags, sections, visibility, attachments |
| Support | Support requests and expert requests |
| Communication | Chat and notifications |
| Transition | Transition dashboard, tasks, phases, certifications, key contacts |
| Onboarding and readiness | Onboarding, approvals, training, shadow assignments, access provisioning, readiness assessments |
| AI-assisted tools | AI search, AI bot, article AI review, ResumeIQ |
| Administration | User/article requests, role and tag management, teams, phone directory, certification administration |

Some capabilities have backend route groups without a matching standalone
frontend route. Confirm feature availability in the target deployment before
describing them as active user-facing features.

## Requested product enhancement

Extend transition planning from the current transition-oriented workflow to
support multiple projects. Users should be able to select or identify a
project, view its transition plan on a dashboard, and update/edit that plan.
Detailed permissions, project hierarchy, and dashboard metrics remain to be
defined during implementation.

## Users and access

The client supports authenticated user experiences and conditionally renders
the Admin navigation section for users with the `Admin` role. Role labels used
in the UI include Admin, Team Lead, Expert, L2 Support, L1 Support, and
Employee. Actual permissions depend on server-side checks, database role
assignments, and deployment configuration.

## Out of scope for this brief

- Hosting provider, production topology, and deployment process
- Guaranteed workflow behavior where implementation or configuration has not
  been verified
- Business metrics, adoption data, or quantified return on investment
- Hiring decisions based solely on ResumeIQ results
