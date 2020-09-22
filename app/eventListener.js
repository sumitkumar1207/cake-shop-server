const config = require("@/config/keys");

/**
 * Event listener for HTTP server "error" event.
 */

const onError = function (error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof config.port === 'string'
        ? 'Pipe ' + config.port
        : 'Port ' + config.port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    };
}


module.exports = {
    // onListening,
    onError
}