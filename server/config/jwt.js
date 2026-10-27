const env = require("./env");

module.exports = {
    SECRET: env.JWT.SECRET,
    EXPIRES_IN: env.JWT.EXPIRES_IN,
};