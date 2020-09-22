const jwtDecode = require('jwt-decode')
let sql = require('@/app/db/database')
const jwt = require('jsonwebtoken')
let keys = require('@/app/config/keys')
const CryptoJS = require("crypto-js");


// middleware function to check for logged-in users
module.exports.isAuthorizedUser = function (role) {

  //Default user object
  let user = { status: "", message: '' }

  return function (req, res, next) {

    //Check of token in the header if missing return response
    if (req.header('Authorization') == undefined || req.header('Authorization') == '' || req.header('Authorization') == null) {
      user.status = false;
      user.message = 'Authorization token is missing';

      req.user_info = user
      next(null, req.user_info)
    } else {

      //Remove the Bearer from token string
      const token = req.header('Authorization').replace('Bearer ', '')

      //Verifying the token from the JWT
      jwt.verify(token, keys.jwtSecret, (error, _decoded) => {

        //Check the token typeof should be string
        if (_decoded && _decoded.token && typeof _decoded.token == "string" && !error) {
          //Decrypt the token from Crypto
          let decoded = JSON.parse(CryptoJS.AES.decrypt(_decoded.token, req.app.config.cryptoSecretKey).toString(CryptoJS.enc.Utf8))
          try {
            //Check for role if routes are role based and private
            if (role && role.length > 0) {
              let role_index = role.indexOf(decoded.role_name);

              if (role_index !== -1) {
                verifyUser(req, res, decoded, role_index, user, next)
              } else {
                user.status = false
                user.message = 'User not authorized'
                req.user_info = user
                next(null, req.user_info)
              }
            } else {
              verifyUser(req, res, decoded, undefined, user, next)
            }
          } catch (error) {
            next("Not authorized to access this resource", false)
          }
          // }
        } else {
          user.status = false;
          user.message = 'Your token has been expired or invalid, Please re-login to access this resource!';
          req.user_info = user
          next(null, req.user_info)
        }
      });
    }
  }
}

//Create function to verify user
const verifyUser = (req, res, decoded, role_index, _user, next) => {
  if (decoded.user_for) {

    let user = {}

    Object.assign(user, _user)

    let sql_query = '';

    if (decoded.user_for == 'user') {

      sql_query = `SELECT 
      us.user_id, 
      us.role_id,
      us.user_mobile,
      us.user_email,
      us.user_address,
      us.city_id,
      us.user_dob,
      us.user_pic,
      us.user_created_date,
      us.user_modified_date,
      us.user_password,
      us.user_name	,
      us.user_gender,
      us.user_status,
      us.user_is_active,
      ro.role_name,
      ro.userrole_active,
      acc.ID,
      acc.user_token,
      acc.firebase_token,
      acc.device_type,
      acc.device_model
      FROM user us
      LEFT JOIN userrole ro ON us.role_id=ro.role_id
      LEFT JOIN access acc ON us.user_id=acc.user_id 
      WHERE us.user_id='${decoded.user_id}' AND us.user_is_active= 'Y'`;
      role_index ? sql_query += ` AND ro.role_id=${decoded.role_id}` : undefined
    }

    sql.query(sql_query, (err, users) => {
      if (err) {
        user.status = false
        user.message = 'DB Error'
        req.user_info = user
        next(null, req.user_info)
      } else {

        if (users.length > 0) {
          if (decoded.user_for == "user") {
            if (users[0].user_status !== 1 || parseInt(users[0].user_status) !== 1) {
              user.status = false
              user.message = "Please verify before use this resource"

              req.user_info = user
              next(null, req.user_info)

            } else {
              let default_user = req.app.config.host_name + users[0]["user_pic"]
              user.status = true
              user.message = "valid user"
              user.user_id = users[0]["user_id"] || ""
              user.role_id = users[0]["role_id"] || ""
              user.role_name = users[0]["role_name"] || ""
              user.user_name = users[0]["user_name"] || ""
              user.user_email = users[0]["user_email"] || ""
              user.user_mobile = users[0]["user_mobile"] || ""
              user.user_address = users[0]["user_address"] || ""
              user.user_dob = users[0]["user_dob"] || ""
              user.user_pic = users[0]["user_pic"] == "" ? default_user : users[0]["user_pic"]
              user.user_gender = users[0]["user_gender"] || ""

              req.user_info = user
              next(null, req.user_info)
            }
          } else {
            user.status = false
            user.message = 'Something went worng'
            req.user_info = user
            next(null, req.user_info)
          }
        } else {
          user.status = false
          user.message = 'User not authorized'
          req.user_info = user
          next(null, req.user_info)
        }
      }
    })
  } else {
    user.status = false
    user.message = 'Expired token, Please re-login'
    req.user_info = user
    next(null, req.user_info)
  }
}
