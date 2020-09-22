const async = require('async');
let connection = require('@/app/db/database')

/**
 * Genrate the password
 */
module.exports.genratePassword = function (n) {
  let length = n && n > 0 && n >= 6 ? n : 6
  let charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    password = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
}