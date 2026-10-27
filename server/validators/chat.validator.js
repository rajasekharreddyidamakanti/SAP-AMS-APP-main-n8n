const Joi = require("joi");

const sendMessage = Joi.object({

    message: Joi.string()
        .trim()
        .min(1)
        .max(2000)
        .required()

});

const createExpertRequest = Joi.object({

    expert_id: Joi.number()
        .integer()
        .required(),

    query: Joi.string()
        .trim()
        .required(),

    module: Joi.string()
        .allow("", null),

    article_id: Joi.number()
        .integer()
        .allow(null)

});

const closeSession = Joi.object({

    reason: Joi.string()
        .trim()
        .required()

});

module.exports = {

    sendMessage,
    createExpertRequest,
    closeSession

};