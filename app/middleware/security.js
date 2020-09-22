const ipBlock = require('express-ip-block');


module.exports.ipAddressValidation = function(config, connection) {
    let allow = false;
    if (config.ipAddressValidation == true) {
        allow = true;
    }

    //Get IP from Table
    const ips = ['127.0.0.1'];
    const options = { allowForwarded: true, allow: allow };
    return ipBlock(ips, options)
}