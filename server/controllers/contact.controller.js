const contactService =
require("../services/contact.service");

const createContact = async (req, res) => {

    try {

        const contact =
        await contactService.createContact(req.body);

        res.status(201).json({

            success: true,

            message: "Contact created successfully",

            data: contact

        });

    }

    catch (error) {

        res.status(error.status || 500).json({

            success: false,

            message: error.message

        });

    }

};

const getAllContacts = async (req, res) => {

    try {

        const { sap_module, escalation_level, is_on_call } = req.query;

        const contacts =
        await contactService.getAllContacts({

            sap_module,

            escalation_level: escalation_level
                ? Number(escalation_level)
                : undefined,

            is_on_call: is_on_call !== undefined
                ? is_on_call === "true"
                : undefined

        });

        res.json({

            success: true,

            data: contacts

        });

    }

    catch (error) {

        res.status(error.status || 500).json({

            success: false,

            message: error.message

        });

    }

};

const getContactById = async (req, res) => {

    try {

        const contact =
        await contactService.getContactById(req.params.id);

        res.json({

            success: true,

            data: contact

        });

    }

    catch (error) {

        res.status(error.status || 500).json({

            success: false,

            message: error.message

        });

    }

};

const updateContact = async (req, res) => {

    try {

        const contact =
        await contactService.updateContact(

            req.params.id,

            req.body

        );

        res.json({

            success: true,

            message: "Contact updated successfully",

            data: contact

        });

    }

    catch (error) {

        res.status(error.status || 500).json({

            success: false,

            message: error.message

        });

    }

};

const deleteContact = async (req, res) => {

    try {

        await contactService.deleteContact(req.params.id);

        res.json({

            success: true,

            message: "Contact deleted successfully"

        });

    }

    catch (error) {

        res.status(error.status || 500).json({

            success: false,

            message: error.message

        });

    }

};

const getOnCallContacts = async (req, res) => {

    try {

        const contacts =
        await contactService.getOnCallContacts(req.query.sap_module);

        res.json({

            success: true,

            data: contacts

        });

    }

    catch (error) {

        res.status(error.status || 500).json({

            success: false,

            message: error.message

        });

    }

};

const setEscalationPath = async (req, res) => {

    try {

        const path =
        await contactService.setEscalationPath(req.body);

        res.json({

            success: true,

            message: "Escalation path saved successfully",

            data: path

        });

    }

    catch (error) {

        res.status(error.status || 500).json({

            success: false,

            message: error.message

        });

    }

};

const getAllEscalationPaths = async (req, res) => {

    try {

        const paths =
        await contactService.getAllEscalationPaths();

        res.json({

            success: true,

            data: paths

        });

    }

    catch (error) {

        res.status(error.status || 500).json({

            success: false,

            message: error.message

        });

    }

};

const getEscalationPathByModule = async (req, res) => {

    try {

        const path =
        await contactService.getEscalationPathByModule(
            req.params.module
        );

        res.json({

            success: true,

            data: path

        });

    }

    catch (error) {

        res.status(error.status || 500).json({

            success: false,

            message: error.message

        });

    }

};

const getContactHistory = async (req, res) => {

    try {

        const history =
        await contactService.getContactHistory(req.params.id);

        res.json({

            success: true,

            data: history

        });

    }

    catch (error) {

        res.status(error.status || 500).json({

            success: false,

            message: error.message

        });

    }

};

module.exports = {

    createContact,

    getAllContacts,

    getContactById,

    updateContact,

    deleteContact,

    getOnCallContacts,

    setEscalationPath,

    getAllEscalationPaths,

    getEscalationPathByModule,

    getContactHistory

};