const db = require("../config/db");

class ReadinessAssessmentRepository {

    async createAssessment(data) {

        const query = `
        INSERT INTO readiness_assessments
        (
            member_id,
            technical_rating,
            process_rating,
            communication_rating,
            confidence_rating,
            overall_rating,
            recommendation,
            remarks,
            assessed_by
        )
        VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *;
        `;

        const { rows } = await db.query(query, [

            data.member_id,
            data.technical_rating,
            data.process_rating,
            data.communication_rating,
            data.confidence_rating,
            data.overall_rating,
            data.recommendation,
            data.remarks,
            data.assessed_by

        ]);

        return rows[0];
    }
    async getAllAssessments() {

        const query = `
        SELECT *
        FROM readiness_assessments
        ORDER BY assessment_id DESC;
        `;

        const { rows } = await db.query(query);

        return rows;
    }

    async getAssessmentByMember(memberId) {

        const query = `
        SELECT *
        FROM readiness_assessments
        WHERE member_id = $1;
        `;

        const { rows } = await db.query(query,[memberId]);

        return rows;
    }

    async updateAssessment(assessmentId, data) {

        const query = `
            UPDATE readiness_assessments
            SET
                technical_rating = COALESCE($2, technical_rating),
                process_rating = COALESCE($3, process_rating),
                communication_rating = COALESCE($4, communication_rating),
                confidence_rating = COALESCE($5, confidence_rating),
                overall_rating = COALESCE($6, overall_rating),
                recommendation = COALESCE($7, recommendation),
                remarks = COALESCE($8, remarks)
            WHERE assessment_id = $1
            RETURNING *;
        `;

        const { rows } = await db.query(query, [

            assessmentId,
            data.technical_rating,
            data.process_rating,
            data.communication_rating,
            data.confidence_rating,
            data.overall_rating,
            data.recommendation,
            data.remarks

        ]);

        return rows[0];
    }

}

module.exports = new ReadinessAssessmentRepository();