const successResponse = (
    res,
    message,
    data = null,
    statusCode = 200
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

const createdResponse = (
    res,
    message,
    data = null
) => {
    return res.status(201).json({
        success: true,
        message,
        data
    });
};

const errorResponse = (
    res,
    message,
    statusCode = 500,
    error = null
) => {
    return res.status(statusCode).json({
        success: false,
        message,
        error
    });
};

module.exports = {
    successResponse,
    createdResponse,
    errorResponse
};