const certificationRepository =
require("../repositories/certification.repository");

class CertificationService {

    async createCertification(data) {

        return await certificationRepository.createCertification(data);

    }

    async getAllCertifications() {

        return await certificationRepository.getAllCertifications();

    }

    async getCertificationsByMember(memberId) {

        return await certificationRepository.getCertificationsByMember(memberId);

    }

    async updateCertification(certificationId, data) {

        return await certificationRepository.updateCertification(

            certificationId,

            data

        );

    }

    async deleteCertification(certificationId) {

        return await certificationRepository.deleteCertification(

            certificationId

        );

    }

}

module.exports = new CertificationService();