const logger = require("../utils/logger");
const { errorResponse } = require("../utils/response");

module.exports = (err, req, res, next) => {
    logger.error(err.stack || err);

    return errorResponse(
        res,
        err.message || "Internal Server Error",
        err.statusCode || 500,
        process.env.NODE_ENV === "development"
            ? err.stack
            : null
    );
};