module.exports = {
    ...require("./auth.validator"),
    ...require("./article.validator"),
    ...require("./attachment.validator"),
    ...require("./section.validator"),
    ...require("./tag.validator"),
    ...require("./role.validator"),
    ...require("./visibility.validator")
};