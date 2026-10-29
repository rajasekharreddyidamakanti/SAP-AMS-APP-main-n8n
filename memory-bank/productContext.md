# Product Context

## User needs addressed

AMS users may need to find trusted operational guidance, ask for support,
coordinate a service handoff, locate expertise, and keep track of updates.
Administrators also need ways to manage shared content and access structures.
The application groups these tasks into a common authenticated interface.

## Primary workflows

### Knowledge article lifecycle

1. Browse or search articles.
2. Create or edit an article and optionally add classification, tags, visibility,
   a co-author, and attachments.
3. Save a draft or submit it for review.
4. Review, approve, or reject content using the available workflow.
5. Reuse published knowledge.

Article statuses represented in backend/database code include `draft`,
`under_review`, `co_author_pending`, `published`, and `rejected`. Verify the
running database constraint before deploying status-related changes.

### Support and collaboration

1. Submit a support request with its description and classification.
2. Track request state.
3. Request expert assistance or use chat where appropriate.
4. Review notifications for updates.

Support status behavior and assignment/escalation rules should be confirmed
against the relevant backend implementation and deployment configuration.

### Transition work

1. Open a transition dashboard.
2. Review progress and phase information.
3. Inspect tasks, assignments, due dates, dependencies, and attachments.
4. Update work and sign-off information where permitted.
5. Use related certification and contact screens.

### Requested multi-project transition planning

The product should support transition plans for multiple distinct projects,
rather than treating transition planning as a single-project experience.
Provide a project-level dashboard so users can locate a project and review its
transition plan, then update or edit the plan.

Initial expected capabilities:

- Distinguish projects and associate each transition plan with its project.
- Browse/select a project and see its plan without mixing another project's
  tasks or progress into the view.
- View plan progress and transition work in a dashboard.
- Create or edit plan information and update phases/tasks using the existing
  transition concepts where suitable.
- Apply server-side authorization to project and plan reads and writes.

These are initial requirements from the product request. Project creation,
project ownership, cross-project summary metrics, exact editable fields,
approval/version history, and role permissions have not yet been specified.
This feature is **planned/requested and not verified as implemented**.

### Onboarding and readiness

The backend defines route groups for onboarding, approvals, training modules
and assignments, shadow assignments, access provisioning, readiness
assessments, and onboarding progress/dashboard views. Do not assume every route
is exposed as a frontend page or enabled in every deployment.

### AI-assisted workflows

- AI search supports knowledge discovery.
- The application has an AI bot and article AI-review endpoints.
- ResumeIQ compares a submitted resume with job information and reports match
  scores, skill matches/gaps, recommendations, and a report.

AI output is decision support. Users must review source information, and
ResumeIQ must not be presented as an automated hiring decision-maker.

## Product principles

- Keep operational knowledge reusable and discoverable.
- Make work status and ownership visible where the relevant workflow supports
  them.
- Keep authorization role-aware; client-side navigation is not a substitute
  for server-side authorization.
- Treat AI results as assistance requiring human judgment.
- Distinguish implemented UI from API-only or configuration-dependent
  capabilities.
