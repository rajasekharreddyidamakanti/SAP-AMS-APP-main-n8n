const db = require("../config/db");

class CertificationRepository {

    async createCertification(data) {

        const query = `
        INSERT INTO certifications
        (
            member_id,
            certification_name,
            provider,
            issue_date,
            expiry_date,
            status,
            certificate_url,
            remarks
        )
        VALUES
        ($1,$2,$3,$4,$5,'completed',$6,$7)
        RETURNING *;
        `;

        const { rows } = await db.query(query, [

            data.member_id,
            data.certification_name,
            data.provider,
            data.issue_date,
            data.expiry_date,
            data.certificate_url,
            data.remarks

        ]);

        return rows[0];
    }

    async getAllCertifications() {

        const query = `
        SELECT *
        FROM certifications
        ORDER BY certification_id DESC;
        `;

        const { rows } = await db.query(query);

        return rows;
    }

    async getCertificationsByMember(memberId) {

        const query = `
        SELECT *
        FROM certifications
        WHERE member_id = $1
        ORDER BY certification_id;
        `;

        const { rows } = await db.query(query, [memberId]);

        return rows;
    }

    async updateCertification(certificationId, data) {

        const query = `
        UPDATE certifications
        SET

            certification_name =
            COALESCE($2, certification_name),

            provider =
            COALESCE($3, provider),

            issue_date =
            COALESCE($4, issue_date),

            expiry_date =
            COALESCE($5, expiry_date),

            status =
            COALESCE($6, status),

            certificate_url =
            COALESCE($7, certificate_url),

            remarks =
            COALESCE($8, remarks)

        WHERE certification_id = $1

        RETURNING *;
        `;

        const { rows } = await db.query(query, [

            certificationId,
            data.certification_name,
            data.provider,
            data.issue_date,
            data.expiry_date,
            data.status,
            data.certificate_url,
            data.remarks

        ]);

        return rows[0];
    }

    async deleteCertification(certificationId) {

        const query = `
        DELETE FROM certifications
        WHERE certification_id = $1
        RETURNING *;
        `;

        const { rows } = await db.query(query, [certificationId]);

        return rows[0];
    }

}

module.exports = new CertificationRepository();