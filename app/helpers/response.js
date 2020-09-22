
const getErrorMessage = function (code) {
    let errorMessage = {
        400: function () { // "Bad Request"
            return { message: "Auth Token is required. Please provide a valid auth token along with request.", status: false, type: "Error" };
        },
        401: function () { // "Unauthorized"
            return { message: "You need to login to view this", status: false, type: "Error" };
        },
        403: function () { // Forbidden
            // "Requested operation is not allowed due to applied rules. Please refer to error details."
            return { message: "You are forbidden from seeing this", status: false, type: "Error" };
        },
        404: function () { // NotFound
            return { message: "The resource referenced by request does not exists.", status: false, type: "Error" };
        },
        405: function () { // MethodNotAllowed
            return { message: "Requested method is not valid", status: false, type: "Error" };
        },
        408: function () { // RequestTimeout
            return { message: "Request getting too much time. please try after some time", status: false, type: "Error" };
        },
        500: function () { // InternalServerError
            return { message: "Something went wrong on server. Please contact server admin.", status: false, type: "Error" };
        },
        501: function () { // NotImplemented Unauthorized
            return { message: "We will patch no such thing", status: false, type: "Error" };
        },
        503: function () { // Service Unavailable
            return { message: "Requested service is unavailable for this time", status: false, type: "Error" };
        },
        200: function () { // success
            return { message: "Success", status: true, type: "OK" };
        },
        201: function () { // Created
            return { message: "Created", status: true, type: "OK" };
        },
    };
    return errorMessage[code]();
};

module.exports = {
    getErrorMessage
};


// const getErrorMessage = function (code) {
//     switch (code) {
//         case 400: // "Bad Request"
//             return { message: "Auth Token is required. Please provide a valid auth token along with request.", status: false, type: "Error" };
//             break;
//         case 401: // "Unauthorized"
//             return { message: "You need to login to view this", status: false, type: "Error" };
//             break;
//         case 403: // Forbidden
//             // "Requested operation is not allowed due to applied rules. Please refer to error details."
//             return { message: "You are forbidden from seeing this", status: false, type: "Error" };
//             break;
//         case 404: // NotFound
//             return { message: "The resource referenced by request does not exists.", status: false, type: "Error" };
//             break;
//         case 405: // MethodNotAllowed
//             return { message: "Requested method is not valid", status: false, type: "Error" };
//             break;
//         case 408: // RequestTimeout
//             return { message: "Request getting too much time. please try after some time", status: false, type: "Error" };
//             break;
//         case 500: // InternalServerError
//             return { message: "Something went wrong on server. Please contact server admin.", status: false, type: "Error" };
//             break;
//         case 501: // NotImplemented Unauthorized
//             return { message: "We will patch no such thing", status: false, type: "Error" };
//             break;
//         case 503: // Service Unavailable
//             return { message: "Requested service is unavailable for this time", status: false, type: "Error" };
//             break;
//         case 200: // success
//             return { message: "Success", status: true, type: "OK" };
//             break;
//         case 201: // Created
//             return { message: "Created", status: true, type: "OK" };
//             break;
//         default:
//             break;
//     }
// };