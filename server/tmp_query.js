const pg = require('pg');
const c = new pg.Client({ host: 'localhost', port: 5432, database: 'SAP_APP', user: 'postgres', password: 'pragati@28' });

async function run() {
  await c.connect();

  // 1. Add due_date to admin_certifications
  await c.query("ALTER TABLE admin_certifications ADD COLUMN IF NOT EXISTS due_date TIMESTAMP");
  console.log("Added due_date to admin_certifications");

  // 2. Seed transition_phases (7 phases)
  const phases = [
    { name: "Planning & Assessment", order: 1 },
    { name: "Knowledge Transfer", order: 2 },
    { name: "Shadow Support", order: 3 },
    { name: "Reverse Shadow", order: 4 },
    { name: "Independent Operations", order: 5 },
    { name: "Hypercare", order: 6 },
    { name: "Closure & Sign-Off", order: 7 },
  ];
  for (const p of phases) {
    await c.query(
      "INSERT INTO transition_phases (phase_name, phase_order) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [p.name, p.order]
    );
  }
  console.log("Seeded 7 transition_phases");

  // 3. Seed checklist_templates
  const phasesResult = await c.query("SELECT phase_id, phase_name FROM transition_phases ORDER BY phase_order");
  const phaseMap = {};
  phasesResult.rows.forEach(r => { phaseMap[r.phase_name] = r.phase_id; });

  const templates = [
    { phase: "Planning & Assessment", item: "Identify stakeholders & team members", desc: "List all key stakeholders for the transition", order: 1 },
    { phase: "Planning & Assessment", item: "Define scope and objectives", desc: "Document the transition scope and success criteria", order: 2 },
    { phase: "Planning & Assessment", item: "Create transition timeline", desc: "Establish milestones and deadlines", order: 3 },
    { phase: "Knowledge Transfer", item: "Document system architecture", desc: "Prepare technical documentation of the system", order: 1 },
    { phase: "Knowledge Transfer", item: "Conduct KT sessions", desc: "Hold knowledge transfer meetings with the team", order: 2 },
    { phase: "Knowledge Transfer", item: "Share credentials & access", desc: "Transfer all necessary system access", order: 3 },
    { phase: "Shadow Support", item: "Shadow current team on incidents", desc: "Observe how the current team handles incidents", order: 1 },
    { phase: "Shadow Support", item: "Shadow on change requests", desc: "Observe change request handling procedures", order: 2 },
    { phase: "Reverse Shadow", item: "Handle incidents independently", desc: "New team handles incidents with oversight", order: 1 },
    { phase: "Reverse Shadow", item: "Execute change requests", desc: "New team processes change requests", order: 2 },
    { phase: "Independent Operations", item: "Operate without guidance", desc: "Full independent operations by the new team", order: 1 },
    { phase: "Independent Operations", item: "SLA compliance check", desc: "Verify all SLAs are being met independently", order: 2 },
    { phase: "Hypercare", item: "Monitor critical processes", desc: "Intensive monitoring of all critical systems", order: 1 },
    { phase: "Hypercare", item: "Escalation drills", desc: "Practice escalation procedures", order: 2 },
    { phase: "Closure & Sign-Off", item: "Final sign-off from stakeholders", desc: "Get formal sign-off from all parties", order: 1 },
    { phase: "Closure & Sign-Off", item: "Archive transition documents", desc: "Archive all documentation for future reference", order: 2 },
    { phase: "Closure & Sign-Off", item: "Lessons learned session", desc: "Conduct retrospective on the transition", order: 3 },
  ];

  for (const t of templates) {
    const phaseId = phaseMap[t.phase];
    if (!phaseId) { console.log("SKIP - phase not found:", t.phase); continue; }
    await c.query(
      "INSERT INTO checklist_templates (phase_id, checklist_item, description, display_order) VALUES ($1, $2, $3, $4)",
      [phaseId, t.item, t.desc, t.order]
    );
  }
  console.log("Seeded checklist_templates");

  // 4. Add phone column to users if not exists
  await c.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)");
  console.log("Added phone column to users (if not exists)");

  console.log("ALL MIGRATIONS COMPLETE");
}

run().catch(e => console.error(e.message)).finally(() => c.end());
