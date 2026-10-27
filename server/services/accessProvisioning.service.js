const accessProvisioningRepository =
require("../repositories/accessProvisioning.repository");

class AccessProvisioningService {

    async createAccess(data) {

        return await accessProvisioningRepository.createAccess(data);

    }

    async getMemberAccess(memberId) {

        return await accessProvisioningRepository.getMemberAccess(memberId);

    }

    async updateAccess(accessId, data) {

        return await accessProvisioningRepository.updateAccess(

            accessId,

            data

        );

    }

}

module.exports = new AccessProvisioningService();