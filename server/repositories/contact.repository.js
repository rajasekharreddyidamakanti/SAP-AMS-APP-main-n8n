const db = require("../config/db");

class ContactRepository {

    async syncUserContact(userId) {
        await db.query(
            `
            UPDATE key_contacts kc
            SET name = u.name,
                email = u.email,
                phone = u.phone_number,
                sap_module = u.department
            FROM users u
            WHERE kc.user_id = u.user_id
              AND u.user_id = $1
            `,
            [userId]
        );

        await db.query(
            `
            INSERT INTO key_contacts (user_id, name, email, phone, sap_module)
            SELECT u.user_id, u.name, u.email, u.phone_number, u.department
            FROM users u
            WHERE u.user_id = $1
              AND u.phone_number IS NOT NULL
              AND NOT EXISTS (
                  SELECT 1 FROM key_contacts kc WHERE kc.user_id = u.user_id
              )
            `,
            [userId]
        );
    }

    async createContact(data) {

        const query = `
        INSERT INTO key_contacts
        (
            user_id,
            name,
            email,
            phone,
            role,
            sap_module,
            escalation_level,
            is_on_call,
            on_call_start,
            on_call_end,
            notes
        )
        VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        RETURNING *;
        `;

        const { rows } = await db.query(query,[

            data.user_id || null,
            data.name,
            data.email || null,
            data.phone || null,
            data.role || null,
            data.sap_module || null,
            data.escalation_level || null,
            data.is_on_call || false,
            data.on_call_start || null,
            data.on_call_end || null,
            data.notes || null

        ]);

        return rows[0];
    }

    async getAllContacts({ sap_module, escalation_level, is_on_call } = {}) {
        await db.query(
            `
            UPDATE key_contacts kc
            SET name = u.name,
                email = u.email,
                phone = u.phone_number,
                sap_module = u.department
            FROM users u
            WHERE kc.user_id = u.user_id
            `
        );
        await db.query(
            `
            INSERT INTO key_contacts (user_id, name, email, phone, sap_module)
            SELECT u.user_id, u.name, u.email, u.phone_number, u.department
            FROM users u
            WHERE u.phone_number IS NOT NULL
              AND NOT EXISTS (
                  SELECT 1 FROM key_contacts kc WHERE kc.user_id = u.user_id
              )
            `
        );

        const conditions = [];
        const values = [];

        if (sap_module) {
            values.push(sap_module);
            conditions.push(`sap_module = $${values.length}`);
        }

        if (escalation_level) {
            values.push(escalation_level);
            conditions.push(`escalation_level = $${values.length}`);
        }

        if (is_on_call !== undefined) {
            values.push(is_on_call);
            conditions.push(`is_on_call = $${values.length}`);
        }

        const whereClause = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        const query = `
        SELECT kc.*, u.name AS linked_user_name, u.email AS linked_user_email
        FROM key_contacts kc
        LEFT JOIN users u ON u.user_id = kc.user_id
        ${whereClause}
        ORDER BY sap_module, escalation_level, name;
        `;

        const { rows } = await db.query(query, values);

        return rows;
    }

    async getContactById(contactId) {

        const query = `
        SELECT *
        FROM key_contacts
        WHERE contact_id=$1;
        `;

        const { rows } = await db.query(query,[contactId]);

        return rows[0];
    }

    async updateContact(contactId, data) {

        const query = `
        UPDATE key_contacts
        SET

            user_id=COALESCE($2,user_id),
            name=COALESCE($3,name),

            email=COALESCE($4,email),

            phone=COALESCE($5,phone),

            role=COALESCE($6,role),

            sap_module=COALESCE($7,sap_module),

            escalation_level=COALESCE($8,escalation_level),

            is_on_call=COALESCE($9,is_on_call),

            on_call_start=COALESCE($10,on_call_start),

            on_call_end=COALESCE($11,on_call_end),

            notes=COALESCE($12,notes)

        WHERE contact_id=$1

        RETURNING *;
        `;

        const { rows } = await db.query(query,[

            contactId,
            data.user_id || null,
            data.name,
            data.email,
            data.phone,
            data.role,
            data.sap_module,
            data.escalation_level,
            data.is_on_call,
            data.on_call_start,
            data.on_call_end,
            data.notes

        ]);

        return rows[0];
    }

    async deleteContact(contactId) {

        await db.query(

            `
            DELETE
            FROM key_contacts
            WHERE contact_id=$1;
            `,

            [contactId]

        );

    }

    async getEscalationPathsForContact(contactId) {
        const { rows } = await db.query(
            `SELECT sap_module,
                    CASE
                        WHEN level_1_contact = $1 THEN 1
                        WHEN level_2_contact = $1 THEN 2
                        WHEN level_3_contact = $1 THEN 3
                    END AS escalation_level
             FROM escalation_paths
             WHERE level_1_contact = $1
                OR level_2_contact = $1
                OR level_3_contact = $1`,
            [contactId]
        );
        return rows;
    }

    async getOnCallContacts(sapModule) {

        const query = `
        SELECT *
        FROM key_contacts
        WHERE is_on_call = TRUE
        AND ($1::VARCHAR IS NULL OR sap_module = $1)
        ORDER BY on_call_start;
        `;

        const { rows } = await db.query(query,[sapModule || null]);

        return rows;
    }

    // ── ESCALATION PATHS ──────────────────────────────

    async upsertEscalationPath(data) {

        const query = `
        INSERT INTO escalation_paths
        (
            sap_module,
            level_1_contact,
            level_2_contact,
            level_3_contact
        )
        VALUES
        ($1,$2,$3,$4)
        ON CONFLICT (sap_module)
        DO UPDATE SET

            level_1_contact = EXCLUDED.level_1_contact,

            level_2_contact = EXCLUDED.level_2_contact,

            level_3_contact = EXCLUDED.level_3_contact

        RETURNING *;
        `;

        const { rows } = await db.query(query,[

            data.sap_module,
            data.level_1_contact || null,
            data.level_2_contact || null,
            data.level_3_contact || null

        ]);

        return rows[0];
    }

    async getEscalationPathByModule(sapModule) {

        const query = `
        SELECT
            modules.sap_module,
            ep.path_id,

            l1.contact_id AS level_1_id,
            l1.name       AS level_1_name,
            l1.phone      AS level_1_phone,
            l1.email      AS level_1_email,

            l2.contact_id AS level_2_id,
            l2.name       AS level_2_name,
            l2.phone      AS level_2_phone,
            l2.email      AS level_2_email,

            l3.contact_id AS level_3_id,
            l3.name       AS level_3_name,
            l3.phone      AS level_3_phone,
            l3.email      AS level_3_email

        FROM (VALUES ('Finance'), ('HR'), ('Supply Chain'), ('MM'), ('SD'), ('PP'), ('QM'), ('PM')) AS modules(sap_module)
        LEFT JOIN escalation_paths ep ON ep.sap_module = modules.sap_module
        LEFT JOIN key_contacts l1 ON ep.level_1_contact = l1.contact_id
        LEFT JOIN key_contacts l2 ON ep.level_2_contact = l2.contact_id
        LEFT JOIN key_contacts l3 ON ep.level_3_contact = l3.contact_id
        WHERE modules.sap_module = $1;
        `;

        const { rows } = await db.query(query,[sapModule]);

        return rows[0];
    }

    async getAllEscalationPaths() {

        const query = `
        SELECT
            modules.sap_module,
            ep.path_id,

            l1.name AS level_1_name,
            l2.name AS level_2_name,
            l3.name AS level_3_name

        FROM (VALUES ('Finance'), ('HR'), ('Supply Chain'), ('MM'), ('SD'), ('PP'), ('QM'), ('PM')) AS modules(sap_module)
        LEFT JOIN escalation_paths ep ON ep.sap_module = modules.sap_module
        LEFT JOIN key_contacts l1 ON ep.level_1_contact = l1.contact_id
        LEFT JOIN key_contacts l2 ON ep.level_2_contact = l2.contact_id
        LEFT JOIN key_contacts l3 ON ep.level_3_contact = l3.contact_id
        ORDER BY modules.sap_module;
        `;

        const { rows } = await db.query(query);

        return rows;
    }

    // ── CONTACT HISTORY (linked to support requests, since
    //    this app has no incidents table — support_requests is
    //    the closest analog) ────────────────────────────────

    async getContactHistory(contactId) {

        const query = `
        SELECT
            sr.request_id,
            sr.title,
            sr.description,
            et.tag_name AS related_module,
            sr.status,
            sr.created_at,
            sr.resolved_at
        FROM support_requests sr
        JOIN request_users ru
            ON ru.request_id = sr.request_id
        JOIN key_contacts kc
            ON kc.user_id = ru.user_id
        LEFT JOIN expertise_tags et
            ON et.tag_id = sr.tag_id
        WHERE kc.contact_id = $1
        ORDER BY sr.created_at DESC
        LIMIT 50;
        `;

        const { rows } = await db.query(query,[contactId]);

        return rows;
    }

}

module.exports = new ContactRepository();