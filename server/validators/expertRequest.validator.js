const Joi = require("joi");

module.exports.createRequest = Joi.object({

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