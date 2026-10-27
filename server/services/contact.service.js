const contactRepository = 
require(
"../repositories/contact.repository");
class ContactService {

    async createContact(data) {

        if (!data.name) {

            throw {
                status: 400,
                message: "Contact name is required"
            };

        }

        return await contactRepository.createContact(data);

    }

    async getAllContacts(filters) {

        return await contactRepository.getAllContacts(filters);

    }

    async getContactById(contactId) {

        const contact =
        await contactRepository.getContactById(contactId);

        if (!contact) {

            throw {
                status: 404,
                message: "Contact not found"
            };

        }

        return contact;

    }

    async updateContact(contactId, data) {

        const updated =
        await contactRepository.updateContact(contactId, data);

        if (!updated) {

            throw {
                status: 404,
                message: "Contact not found"
            };

        }

        return updated;

    }

    async deleteContact(contactId) {
        await this.getContactById(contactId);
        const paths = await contactRepository.getEscalationPathsForContact(contactId);
        if (paths.length > 0) {
            const pathText = paths.map((path) => `${path.sap_module} (Level ${path.escalation_level})`).join(", ");
            throw {
                status: 409,
                message: `Cannot delete this contact while assigned to escalation paths: ${pathText}. Reassign those paths first.`
            };
        }
        await contactRepository.deleteContact(contactId);

    }

    async getOnCallContacts(sapModule) {

        return await contactRepository.getOnCallContacts(sapModule);

    }

    async setEscalationPath(data) {

        if (!data.sap_module) {

            throw {
                status: 400,
                message: "sap_module is required"
            };

        }

        return await contactRepository.upsertEscalationPath(data);

    }

    async getEscalationPathByModule(sapModule) {

        const path =
        await contactRepository.getEscalationPathByModule(sapModule);

        if (!path) {

            throw {
                status: 404,
                message: `No escalation path configured for module: ${sapModule}`
            };

        }

        return path;

    }

    async getAllEscalationPaths() {

        return await contactRepository.getAllEscalationPaths();

    }

    async getContactHistory(contactId) {

        // confirm contact exists first
        await this.getContactById(contactId);

        return await contactRepository.getContactHistory(contactId);

    }

}

module.exports = new ContactService();