const db = require("../config/db");

class TransitionRepository {

    async createTransition(data) {

        const query = `
            INSERT INTO transitions
            (
                from_user_id,
                to_user_id,
                sap_module,
                start_date,
                target_completion_date,
                overall_status,
                remarks,
                created_by
            )
            VALUES
            ($1,$2,$3,$4,$5,'in_progress',$6,$7)
            RETURNING *;
        `;

        const { rows } = await db.query(query, [

            data.from_user_id,
            data.to_user_id,
            data.sap_module,
            data.start_date,
            data.target_completion_date,
            data.remarks,
            data.created_by

        ]);

        return rows[0];
    }



    async createDefaultTasks(transitionId, fromUserId, toUserId, startDate) {
        const phaseResult = await db.query(
            "SELECT phase_id, phase_name FROM transition_phases ORDER BY phase_order"
        );
        const phaseIds = Object.fromEntries(
            phaseResult.rows.map((phase) => [phase.phase_name, phase.phase_id])
        );
        const tasks = [
            { title: "Identify Transition Scope", description: "Define systems, processes, responsibilities, and stakeholders in scope.", phase: "Discovery & Planning", assigned_to: fromUserId, dayOffset: 1 },
            { title: "Create Transition Plan", description: "Document timeline, milestones, owners, risks, and dependencies.", phase: "Discovery & Planning", assigned_to: fromUserId, dayOffset: 2 },
            { title: "Assess Risks & Dependencies", description: "Identify risks and dependencies that could impact the transition.", phase: "Discovery & Planning", assigned_to: fromUserId, dayOffset: 3 },
            { title: "Share Project Documents", description: "Provide access to relevant documents, wikis, and runbooks.", phase: "Knowledge Transfer", assigned_to: fromUserId, dayOffset: 5 },
            { title: "Knowledge Transfer Sessions", description: "Walk through key processes and systems with the new owner.", phase: "Knowledge Transfer", assigned_to: fromUserId, dayOffset: 8 },
            { title: "Review Historical Issues", description: "Discuss past incidents and how they were resolved.", phase: "Knowledge Transfer", assigned_to: fromUserId, dayOffset: 10 },
            { title: "Provide System Access", description: "Set up accounts, credentials, and tool access for the new owner.", phase: "Training & Onboarding", assigned_to: toUserId, dayOffset: 12 },
            { title: "Conduct Onboarding Training", description: "Complete required training and onboarding activities.", phase: "Training & Onboarding", assigned_to: toUserId, dayOffset: 14 },
            { title: "Readiness Assessment", description: "Evaluate the new owner's confidence and competence.", phase: "Readiness", assigned_to: toUserId, dayOffset: 18 },
            { title: "Address Open Gaps", description: "Resolve outstanding knowledge or access gaps.", phase: "Readiness", assigned_to: toUserId, dayOffset: 20 },
            { title: "Final Sign-off", description: "Formal confirmation that the handover is complete.", phase: "Closure", assigned_to: toUserId, dayOffset: 25 },
            { title: "Transfer Ownership", description: "Update ownership records and notify stakeholders.", phase: "Handover & Onboarding", assigned_to: toUserId, dayOffset: 27 },
            { title: "Post-Handover Support", description: "Agree on a support window for follow-up questions.", phase: "Handover & Onboarding", assigned_to: toUserId, dayOffset: 30 },
        ].map((task) => ({ ...task, phase_id: phaseIds[task.phase] }));

        if (tasks.some((task) => !task.phase_id)) {
            throw new Error("Transition phases are not initialized. Run migration_transition_tasks.sql.");
        }

        const base = startDate ? new Date(startDate) : new Date();
        let previousTaskId = null;

        for (const task of tasks) {

            const dueDate = new Date(base);
            dueDate.setDate(dueDate.getDate() + task.dayOffset);

            const { rows } = await db.query(
                `
                INSERT INTO transition_tasks
                (
                    transition_id,
                    title,
                    description,
                    phase_id,
                    status,
                    assigned_to,
                    due_date,
                    depends_on_task_id
                )
                VALUES
                ($1,$2,$3,$4,'pending',$5,$6,$7)
                RETURNING task_id
                `,
                [
                    transitionId,
                    task.title,
                    task.description,
                    task.phase_id,
                    task.assigned_to,
                    dueDate,
                    previousTaskId
                ]
            );

            previousTaskId = rows[0].task_id;

        }

    }

async getAllTransitions() {
    const query = `
        SELECT
            t.*,
            t.overall_status AS status,
            fu.name AS from_user_name, fu.email AS from_user_email,
            tu.name AS to_user_name, tu.email AS to_user_email,

            COUNT(tt.task_id) AS total_tasks,

            COUNT(
                CASE
                    WHEN tt.status = 'completed'
                    THEN 1
                END
            ) AS completed_tasks,

            CASE
                WHEN COUNT(tt.task_id) = 0 THEN 0
                ELSE ROUND(
                    COUNT(
                        CASE
                            WHEN tt.status = 'completed'
                            THEN 1
                        END
                    ) * 100.0 / COUNT(tt.task_id)
                )
            END AS completion_percentage

        FROM transitions t

        LEFT JOIN users fu ON t.from_user_id = fu.user_id
        LEFT JOIN users tu ON t.to_user_id = tu.user_id

        LEFT JOIN transition_tasks tt
            ON tt.transition_id = t.transition_id

        GROUP BY t.transition_id, fu.name, fu.email, tu.name, tu.email

        ORDER BY t.transition_id DESC;
    `;

    const { rows } = await db.query(query);

    return rows;
}

    async deleteTransition(id) {

        // Remove dependent rows first so we don't hit FK constraints.
        await db.query(
            `DELETE FROM transition_tasks WHERE transition_id = $1;`,
            [id]
        );

        await db.query(
            `DELETE FROM transition_checklist WHERE transition_id = $1;`,
            [id]
        );

        const { rows } = await db.query(
            `DELETE FROM transitions WHERE transition_id = $1 RETURNING *;`,
            [id]
        );

        return rows[0];
    }
    

    async getMyTransitions(userId) {

        const query = `
            SELECT
                t.*,
                t.overall_status AS status,
                fu.name AS from_user_name, fu.email AS from_user_email,
                tu.name AS to_user_name, tu.email AS to_user_email,

                COUNT(DISTINCT tt.task_id) AS total_tasks,

                COUNT(
                    DISTINCT CASE
                        WHEN tt.status = 'completed'
                        THEN tt.task_id
                    END
                ) AS completed_tasks,

                CASE
                    WHEN COUNT(DISTINCT tt.task_id) = 0 THEN 0
                    ELSE ROUND(
                        COUNT(
                            DISTINCT CASE
                                WHEN tt.status = 'completed'
                                THEN tt.task_id
                            END
                        ) * 100.0 / COUNT(DISTINCT tt.task_id)
                    )
                END AS completion_percentage

            FROM transitions t
            LEFT JOIN users fu ON t.from_user_id = fu.user_id
            LEFT JOIN users tu ON t.to_user_id = tu.user_id
            LEFT JOIN transition_tasks tt ON tt.transition_id = t.transition_id
            WHERE t.from_user_id = $1
               OR t.to_user_id = $1
               OR tt.assigned_to = $1
            GROUP BY t.transition_id, fu.name, fu.email, tu.name, tu.email
            ORDER BY t.transition_id DESC;
        `;

        const { rows } = await db.query(query, [userId]);

        return rows;
    }
    async deleteTransition(id) {

        await db.query(`DELETE FROM transitions WHERE transition_id = $1`, [id]);

    }


    async getTransitionById(id) {

        const query = `
            SELECT *
            FROM transitions
            WHERE transition_id=$1;
        `;

        const { rows } = await db.query(query,[id]);

        return rows[0];
    }



    // Added for testing the database

    async getTasks(transitionId){

        const query = `
        SELECT

            tt.task_id,
            tt.title,
            tt.description,
            tt.phase_id,
            tp.phase_name,
            tt.status,
            tt.completed_at,
            tt.due_date,
            tt.assigned_to,
            u.name AS assigned_to_name,

            tt.depends_on_task_id,
            dep.title AS depends_on_title,
            dep.status AS depends_on_status,

            tt.signed_off_by,
            su.name AS signed_off_by_name,
            tt.sign_off_notes

        FROM transition_tasks tt

        JOIN transition_phases tp
            ON tt.phase_id=tp.phase_id

        LEFT JOIN users u
            ON tt.assigned_to = u.user_id

        LEFT JOIN users su
            ON tt.signed_off_by = su.user_id

        LEFT JOIN transition_tasks dep
            ON tt.depends_on_task_id = dep.task_id

        WHERE tt.transition_id=$1

        ORDER BY
            tp.phase_order,
            tt.task_id;
        `;

        const {rows}=await db.query(query,[transitionId]);

        return rows;
    }

    async getTaskById(taskId) {

        const query = `
            SELECT
                tt.*,
                dep.status AS depends_on_status,
                dep.title  AS depends_on_title
            FROM transition_tasks tt
            LEFT JOIN transition_tasks dep
                ON tt.depends_on_task_id = dep.task_id
            WHERE tt.task_id = $1;
        `;

        const { rows } = await db.query(query, [taskId]);

        return rows[0];
    }

    async createTask(data) {
        const { rows } = await db.query(
            `
            INSERT INTO transition_tasks
                (transition_id, title, description, phase_id, status, assigned_to, due_date, depends_on_task_id)
            VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7)
            RETURNING *;
            `,
            [
                data.transition_id,
                data.title,
                data.description || null,
                data.phase_id,
                data.assigned_to || null,
                data.due_date || null,
                data.depends_on_task_id || null
            ]
        );
        return rows[0];
    }

    async updateTaskDetails(taskId, data) {
        const { rows } = await db.query(
            `
            UPDATE transition_tasks
            SET title = $2,
                description = $3,
                due_date = $4,
                assigned_to = $5,
                depends_on_task_id = $6,
                phase_id = $7
            WHERE task_id = $1
            RETURNING *;
            `,
            [
                taskId,
                data.title,
                data.description || null,
                data.due_date || null,
                data.assigned_to || null,
                data.depends_on_task_id || null,
                data.phase_id
            ]
        );
        return rows[0];
    }

    async getDependentTasks(taskId) {
        const { rows } = await db.query(
            `SELECT task_id, assigned_to, title FROM transition_tasks WHERE depends_on_task_id = $1`,
            [taskId]
        );
        return rows;
    }

    async wouldCreateDependencyCycle(taskId, dependencyTaskId) {
        const { rows } = await db.query(
            `
            WITH RECURSIVE dependency_chain AS (
                SELECT task_id, depends_on_task_id, ARRAY[task_id] AS path
                FROM transition_tasks
                WHERE task_id = $1

                UNION ALL

                SELECT task.task_id, task.depends_on_task_id, chain.path || task.task_id
                FROM transition_tasks task
                JOIN dependency_chain chain
                    ON task.task_id = chain.depends_on_task_id
                WHERE chain.depends_on_task_id IS NOT NULL
                    AND NOT task.task_id = ANY(chain.path)
            )
            SELECT 1
            FROM dependency_chain
            WHERE depends_on_task_id = $2
            LIMIT 1;
            `,
            [dependencyTaskId, taskId]
        );

        return rows.length > 0;
    }

    async deleteTask(taskId) {
        const { rows } = await db.query(
            `DELETE FROM transition_tasks WHERE task_id = $1 RETURNING *`,
            [taskId]
        );
        return rows[0];
    }

    async updateTaskStatus(taskId, status, userId, signOffNotes) {

        let completedAt = null;
        let signedOffBy = null;

        if (status === "completed") {
            completedAt = new Date();
            signedOffBy = userId || null;
        }

        const query = `
            UPDATE transition_tasks
            SET
                status = $2,
                completed_at = $3,
                signed_off_by = COALESCE($4, signed_off_by),
                sign_off_notes = COALESCE($5, sign_off_notes)
            WHERE task_id = $1
            RETURNING *;
        `;

        const { rows } = await db.query(query, [
            taskId,
            status,
            completedAt,
            signedOffBy,
            signOffNotes || null
        ]);

        return rows[0];
    }

    async syncTransitionStatus(transitionId) {
        const { rows } = await db.query(
            `
            UPDATE transitions t
            SET overall_status = CASE
                WHEN task_counts.total_tasks > 0
                 AND task_counts.completed_tasks = task_counts.total_tasks
                    THEN 'completed'
                ELSE 'in_progress'
            END,
            updated_at = CURRENT_TIMESTAMP
            FROM (
                SELECT
                    COUNT(*)::INTEGER AS total_tasks,
                    COUNT(*) FILTER (WHERE status = 'completed')::INTEGER AS completed_tasks
                FROM transition_tasks
                WHERE transition_id = $1
            ) task_counts
            WHERE t.transition_id = $1
            RETURNING t.*;
            `,
            [transitionId]
        );

        return rows[0];
    }

    async getPhaseProgress(transitionId) {

        const query = `
            SELECT
                tp.phase_id,
                tp.phase_name,
                tp.phase_order,

                COUNT(tt.task_id) AS total_tasks,

                COUNT(
                    CASE WHEN tt.status = 'completed' THEN 1 END
                ) AS completed_tasks,

                CASE
                    WHEN COUNT(tt.task_id) = 0 THEN 0
                    ELSE ROUND(
                        COUNT(
                            CASE WHEN tt.status = 'completed' THEN 1 END
                        ) * 100.0 / COUNT(tt.task_id)
                    )
                END AS completion_percentage

            FROM transition_phases tp

            LEFT JOIN transition_tasks tt
                ON tt.phase_id = tp.phase_id
                AND tt.transition_id = $1

            GROUP BY tp.phase_id, tp.phase_name, tp.phase_order
            ORDER BY tp.phase_order;
        `;

        const { rows } = await db.query(query, [transitionId]);

        return rows;
    }

}

module.exports = new TransitionRepository();