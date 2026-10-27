const db = require("../config/db");

class TrainingAssignmentRepository {

    async assignModule(data) {

        const query = `
        INSERT INTO training_assignments
        (
            member_id,
            module_id,
            status,
            notes
        )
        VALUES
        ($1,$2,'not_started',$3)
        RETURNING *;
        `;

        const { rows } = await db.query(query, [

            data.member_id,
            data.module_id,
            data.notes

        ]);

        return rows[0];
    }

    async getAssignments(memberId) {

        const query = `
        SELECT

            ta.assignment_id,
            ta.status,
            ta.completed_at,
            ta.notes,

            tm.module_id,
            tm.title,
            tm.description,
            tm.sap_module,
            tm.is_required

        FROM training_assignments ta

        JOIN training_modules tm
        ON ta.module_id = tm.module_id

        WHERE ta.member_id = $1

        ORDER BY ta.assignment_id;
        `;

        const { rows } = await db.query(query,[memberId]);

        return rows;
    }

    async updateAssignment(assignmentId,data){

        let completedAt = null;

        if(data.status==="completed"){
            completedAt = new Date();
        }

        const query = `
        UPDATE training_assignments
        SET

            status=$2,

            notes=COALESCE($3,notes),

            completed_at=$4

        WHERE assignment_id=$1

        RETURNING *;
        `;

        const { rows } = await db.query(query,[

            assignmentId,
            data.status,
            data.notes,
            completedAt

        ]);

        return rows[0];
    }

}

module.exports = new TrainingAssignmentRepository();