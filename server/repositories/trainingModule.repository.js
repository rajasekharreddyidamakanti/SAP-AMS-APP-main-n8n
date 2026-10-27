const db = require("../config/db");

class TrainingModuleRepository {

    async createModule(data) {

        const query = `
        INSERT INTO training_modules
        (
            title,
            description,
            sap_module,
            is_required
        )
        VALUES
        ($1,$2,$3,$4)
        RETURNING *;
        `;

        const { rows } = await db.query(query,[

            data.title,
            data.description,
            data.sap_module,
            data.is_required

        ]);

        return rows[0];
    }

    async getAllModules() {

        const query = `
        SELECT *
        FROM training_modules
        ORDER BY module_id DESC;
        `;

        const { rows } = await db.query(query);

        return rows;
    }

    async getModuleById(moduleId) {

        const query = `
        SELECT *
        FROM training_modules
        WHERE module_id=$1;
        `;

        const { rows } = await db.query(query,[moduleId]);

        return rows[0];
    }

    async updateModule(moduleId,data) {

        const query = `
        UPDATE training_modules
        SET

            title=COALESCE($2,title),

            description=COALESCE($3,description),

            sap_module=COALESCE($4,sap_module),

            is_required=COALESCE($5,is_required)

        WHERE module_id=$1

        RETURNING *;
        `;

        const { rows } = await db.query(query,[

            moduleId,
            data.title,
            data.description,
            data.sap_module,
            data.is_required

        ]);

        return rows[0];
    }

    async deleteModule(moduleId){

        await db.query(

            `
            DELETE
            FROM training_modules
            WHERE module_id=$1;
            `,

            [moduleId]

        );

    }

}

module.exports = new TrainingModuleRepository();