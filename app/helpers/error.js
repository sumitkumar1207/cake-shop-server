
const { getErrorMessage } = require('@/helpers/response')

class ErrorHandler extends Error {
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }
};
const handleError = (error, res) => {
    const { statusCode = 405 } = error;
    res.status(statusCode).json({
        status: false,
        statusCode,
        ...getErrorMessage(statusCode)
    });
};
module.exports = {
    ErrorHandler,
    handleError
};