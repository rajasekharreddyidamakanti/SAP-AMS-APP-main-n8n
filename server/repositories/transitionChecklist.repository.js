const db = require("../config/db");

class TransitionChecklistRepository {

    async getChecklistTemplates() {

        const query = `
            SELECT *
            FROM checklist_templates
            ORDER BY phase_id, display_order;
        `;

        const { rows } = await db.query(query);

        return rows;
    }

    async createChecklistItem(data) {

        const query = `
            INSERT INTO transition_checklist
            (
                transition_id,
                template_id,
                status
            )
            VALUES
            ($1,$2,'pending');
        `;

        await db.query(query, [
            data.transition_id,
            data.template_id
        ]);
    }

    async getChecklist(transitionId) {

        const query = `
            SELECT

                tc.checklist_id,
                cp.phase_name,
                ct.checklist_item,
                ct.description,
                tc.status,
                tc.remarks,
                tc.completed_at

            FROM transition_checklist tc

            JOIN checklist_templates ct
                ON tc.template_id = ct.template_id

            JOIN transition_phases cp
                ON ct.phase_id = cp.phase_id

            WHERE tc.transition_id = $1

            ORDER BY
                cp.phase_order,
                ct.display_order;
        `;

        const { rows } = await db.query(query, [transitionId]);

        return rows;
    }

    async updateChecklist(checklistId, data) {

        let completedAt = null;

        if (data.status === "completed") {
            completedAt = new Date();
        }

        const query = `
            UPDATE transition_checklist
            SET
                status = $2,
                remarks = $3,
                completed_by = $4,
                completed_at = $5
            WHERE checklist_id = $1
            RETURNING *;
        `;

        const { rows } = await db.query(query, [

            checklistId,
            data.status,
            data.remarks,
            data.completed_by,
            completedAt

        ]);

        return rows[0];
    }

}

module.exports = new TransitionChecklistRepository();