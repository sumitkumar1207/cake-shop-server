let bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
let jwt_token = require('jsonwebtoken')
let moment = require('moment');
const async = require('async');
const request = require("request")
import CryptoJS from "crypto-js";
const { ErrorHandler } = require('@/helpers/error')
let sql = require('@/app/db/database')
let { sendEmail } = require('@/app/util/mail/sendmail')
let { genrateOTP } = require('@/app/util/mail/genrateOTP')
let insertMany = require('@/app/helpers/functions').insertMany;
let calulateDistance = require('@/app/helpers/functions').calulateDistance;
const { executeQuery } = require('@/app/helpers/collection')

import { sqlPaginate, sqlTableCount } from '@/app/helpers/collection';

let keys = require('@/app/config/keys')

//@route    POST 5500/app/user/register
//@desc     Register new user
//@access   Public
module.exports.Register = function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let message = errors.hasOwnProperty('errors') && errors.errors.length > 0 ? errors.errors : [{ msg: '!Something went wrong' }];
    return res.status(200).json({ status: false, message: message[0].msg, errors: errors.array(), Records: [] });
  } else {
    /**
     * Get all the keys value from body
     */
    let { user_email, user_name, user_password, user_mobile, user_address, city_id, user_dob, user_pic, user_gender, user_status, request_from, role_id, firebase_token, device_type, device_model } = req.body;

    // user_created_date
    // user_modified_date
    // user_active

    /**
     * Call the random code genrator
     */
    let code = genrateOTP(4);
    /**
     * Call the phone validation and append the country code deafault india.
     */
    let mobile_with_code = validatePhone(user_mobile);
    if (mobile_with_code) {
      /**
       * Append the processed value to the field
       */
      req.body.user_mobile = mobile_with_code;
      user_mobile = mobile_with_code
      /**
       * Check the email exists or not.
       * Email and mobile no should be unique.
       * Per email id new mobile.
       */
      sql.query(`SELECT * from user WHERE user_email='${user_email}' OR user_mobile='${user_mobile}'`, (err_f_user, existing_users) => {
        if (err_f_user) {
          return res.status(200).json({ status: false, message: "SQL error while finding", Records: [], error: err_f_user });
        } else if (existing_users && existing_users.length > 0) {
          return res.status(200).json({
            status: false, message: "User already registered with this credential, Please try with different! ", Records: [], error: "User already registered with this credential, Please try with different! "
          });
        } else {
          /**
           * Call the plivo to send the otp.
           */
          /**
           * Validate the password.
           * Strong and medium strong.
           */
          let validBodyData = validateUserData(req.body);
          request_from = request_from || ""

          //check for validation
          if (!validBodyData.password_payload.status) {
            let pp = validBodyData.password_payload
            res.status(200).json({ status: pp.status, message: pp.message, Records: [], error: pp.message })
          } else {

            //hash the password
            let password = bcrypt.hashSync(user_password, 10)
            /**
             * Creating user payload with all the details.
             * Skiping user verification if super admin adding.
             */
            let userDetails = {
              role_id: role_id || 3,  // 1 super admin, 2 admin, 3 user
              user_email: user_email,
              user_name: user_name,
              user_password: password,
              user_mobile: user_mobile ? user_mobile : "911223456789",
              user_address: user_address ? user_address : "",
              city_id: city_id ? city_id : 0,
              user_dob: user_dob ? user_dob : "",
              user_pic: (user_pic && user_pic == '') ? user_pic : "/assets/icons/default_user.jpeg",
              user_created_date: new Date(),
              user_modified_date: new Date(),
              user_gender: user_gender ? user_gender : "",
              user_status: request_from == 'admin' ? 1 : 0,
              user_is_active: "Y"
            }

            sql.query("INSERT INTO user SET ?", userDetails, async function (error, result) {
              if (error) {
                res.status(200).json({ status: false, message: "SQL error while insert", Records: [], error: error });
                // throw new ErrorHandler(404)
              } else {
                /**
                 * Send greet email to user 
                 */
                let greetingMail = {
                  to: userDetails.user_email, subject: 'Thank you', text: 'Thank you for registering', template: 'registerConfirmEmail', messageBody: {
                    user_name: userDetails.user_name,
                    image_path: `${req.app.config.host_name}/assets/logo/logo.png`
                  }
                }
                //Call the helper function
                // sendEmail.sendEmail(greetingMail);

                async.parallel({
                  save_in_access: function (callback1) {
                    /**
                     * Creating a payload for storing information in the access table
                     */
                    device_type ? device_type.toLowerCase() : ""
                    let access_payload = {
                      user_id: result.insertId,
                      user_token: "",
                      firebase_token: firebase_token || "",
                      device_type: device_type || "",
                      device_model: device_model || "",
                      expiry_date: new Date()
                    }
                    let insert_access = `INSERT INTO access SET ?`
                    sql.query(insert_access, access_payload, function (ins_acc_err, acc_resp) {
                      ins_acc_err ? callback1(ins_acc_err, null) : callback1(null, acc_resp)
                    })
                  },
                  save_in_otp_code: function (callback2) {
                    // let OTP = genrateOTP.genrateOTP(6);
                    let mail = {
                      to: userDetails.user_email,
                      subject: 'Get OTP',
                      text: 'Your Otp is',
                      template: 'OTPVerify',
                      messageBody: {
                        user_name: userDetails.user_name,
                        OTP_key: code,
                        OTP_key_arr: [...code.toString()],
                        image_path: `${req.app.config.host_name}/assets/logo/logo.png`
                      }
                    }
                    sendEmail(mail);

                    /**
                     * Otp payload to save in the table with following details
                     */
                    let opt_details = {
                      user_id: result.insertId,
                      user_email: userDetails.user_email,
                      otp: code,
                      otp_expire: new Date((new Date()).getTime() + 2 * 60000),
                      is_active: "Y",
                      is_verified: "N",
                    }

                    sql.query("INSERT INTO otp_code SET ?", opt_details, function (error, result) {
                      if (error) {
                        callback2({ status: false, message: "SQL error while insert", Records: [], error: error }, null);
                      } else {
                        // sendEmail.sendEmail(mail);
                        callback2(null, { status: true, message: `We have sent you otp, Please verify this.`, Records: [], error: null })
                        // callback2(null, { status: true, message: `We have sent you verification code to ${user_mobile} Please verify this.`, Records: [], error: null })
                      }
                    });
                  },
                }, function (parallelErr, parallelResp) {
                  if (parallelErr) {
                    res.json(parallelErr)
                  } else {
                    res.json(parallelResp.save_in_otp_code)
                  }
                })
              }
            });
            // }
            // }
            // })
          }
        }
      })
    } else {
      return res.status(200).json({ status: false, message: "Invalid Phone", err: "Invalid Phone", Records: [] })
    }
  }
}

//Validate the body data of user
function validateUserData(payload) {
  let password_payload = { status: false, message: '', value: '' }
  let mobile_payload = { status: false, message: '', value: '' }

  //password validation
  let strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
  let mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.*[!@#\$%\^&\*])(?=.{8,})");

  if (payload["user_password"] && strongRegex.test(payload["user_password"])) {
    password_payload.status = true
    password_payload.message = "valid password"
    password_payload.value = payload["user_password"]
  } else if (payload["user_password"] && mediumRegex.test(payload["user_password"])) {
    password_payload.status = true
    password_payload.message = "Medium valid password"
    password_payload.value = payload.user_password
  } else {
    password_payload.status = false
    password_payload.message = `Invalid password, Your password should contain:\n-minimum 8 characters\nA number and special characters`
    password_payload.value = payload.user_password
  }


  //mobile validation
  let regex = /^(?!.*(\d)\1{5}).*$/;
  if (payload["user_mobile"] && isNaN(payload["user_mobile"])) {
    mobile_payload.status = false
    mobile_payload.message = `Invalid mobile number`
    mobile_payload.value = payload.user_mobile
  }
  else if (payload["user_mobile"] && payload["user_mobile"].length < 8 || payload["user_mobile"] && payload["user_mobile"].length > 13) {
    mobile_payload.status = false
    mobile_payload.message = `Invalid mobile number`
    mobile_payload.value = payload.user_mobile
  }
  else if (payload["user_mobile"] && !regex.test(payload["user_mobile"])) {
    mobile_payload.status = false
    mobile_payload.message = `Invalid mobile number`
    mobile_payload.value = payload.user_mobile
  }
  else {
    mobile_payload.status = true
    mobile_payload.message = `Valid mobile number`
    mobile_payload.value = payload.user_mobile
  }

  // return { password_payload, mobile_payload };
  return { password_payload };
}

//@route    POST 5500/app/user/login
//@desc     Login registerd user
//@access   Public
module.exports.Login = function (req, res) {
  // throw new ErrorHandler(404);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let message = errors.hasOwnProperty('errors') && errors.errors.length > 0 ? errors.errors : [{ msg: '!Something went wrong' }];
    return res.status(200).json({ status: false, message: message[0].msg, errors: errors.array(), Records: [] });
  } else {
    let role_id = 1;
    let { user_email, user_password, firebase_token, device_type, device_model, request_from } = req.body;
    request_from = request_from ? request_from : "";

    let find_query = `
    SELECT
    us.user_id,
    us.role_id,
    us.user_mobile,
    us.user_email,
    us.user_address,
    us.user_dob,
    us.user_pic,
    us.user_created_date,
    us.user_modified_date,
    us.user_name,
    us.user_gender,
    us.user_password,
    us.user_status,
    ro.role_id,
    ro.role_name
    FROM user us
    INNER JOIN userrole ro ON us.role_id=ro.role_id
    WHERE us.user_email='${user_email}' AND us.user_is_active= 'Y'`
    if (request_from == "admin") {
      find_query += " AND (us.role_id!=3)"
    } else {
      find_query += " AND (us.role_id=3)"
    }
    // console.log('find_query :>> ', find_query);
    sql.query(find_query, (err, users) => {
      // console.log('users :>> ', users);
      if (err) {
        res.status(200).json({
          status: false,
          message: "SQL error while finding",
          Records: [],
          error: err,
        });
      } else {
        if (users.length > 0) {
          // console.log('users :>> ', users);
          let db_role_id = parseInt(users && users[0]["role_id"])
          //Check for password
          bcrypt.compare(user_password, users[0].user_password, async function (bcrypt_err, result) {
            // console.log('result, users[0]  IN Login:', result, users[0]);
            if (result == true) {

              //Check for verified user
              if (users[0].user_status == 0 || parseInt(users[0].user_status) == 0) {
                res.status(200).json({
                  status: true,
                  message: "Please verify your account",
                  Records: [{ user_status: users[0].user_status }],
                  error: "Please verify your account",
                });
              } else {

                let roles = await executeQuery(`SELECT * FROM userrole WHERE role_id=${users[0].role_id} AND is_active='Y'`);

                const payload = {
                  role_id: users[0].role_id,
                  role_name: roles ? roles[0].role_name : "",
                  user_id: users[0].user_id,
                  user_name: users[0].user_name,
                  user_email: users[0].user_email,
                  user_for: "user"
                };

                device_type ? device_type.toLowerCase() : ""
                let access_payload = {
                  user_id: payload.user_id,
                  user_token: "",
                  firebase_token: firebase_token || "",
                  device_type: device_type || "",
                  device_model: device_model || "",
                  expiry_date: new Date()
                }
                // console.log('Access payload OF USER :>> ', access_payload);
                let find_access = `SELECT * FROM access WHERE user_id='${payload.user_id}'`;

                sql.query(find_access, (find_access_err, existing_acc) => {
                  if (find_access_err) {
                    res.status(200).json({ status: false, message: "SQL error while Finding", Records: [], error: find_access_err });
                  } else if (existing_acc && existing_acc.length > 0) {
                    let update_access = `UPDATE access SET ? WHERE user_id='${payload.user_id}'`;

                    sql.query(update_access, access_payload, (up_acc_err, upd_acc_result) => {
                      if (up_acc_err) {
                        res.status(200).json({ status: false, message: "SQL error while Updating", Records: [], error: up_acc_err });
                      } else {
                        //Attach the fire base
                        payload.firebase_token = firebase_token;

                        let setEncryptedData = CryptoJS.AES.encrypt(JSON.stringify(payload), req.app.config.cryptoSecretKey).toString();

                        let token = jwt_token.sign({ token: setEncryptedData }, req.app.config.jwtSecret, { expiresIn: "30d" });

                        res.json({
                          status: true,
                          message: "Successfuly loggedin.",
                          Records: [{
                            user_status: users[0].user_status,
                            token: "Bearer " + token,
                            user_name: users[0].user_name,
                            user_email: users[0].user_email,
                            user_pic: req.app.config.host_name + users[0].user_pic,
                            role_name: users[0].role_name
                          }]
                        });
                      }
                    })
                  } else {
                    sql.query(`INSERT INTO access SET ?`, access_payload, (new_acc_err, added_acc) => {
                      if (new_acc_err) {
                        res.status(200).json({ status: false, message: "SQL error while Inserting", Records: [], error: new_acc_err, });
                      } else {

                        //Attach the fire base
                        payload.firebase_token = firebase_token;

                        let setEncryptedData = CryptoJS.AES.encrypt(JSON.stringify(payload), req.app.config.cryptoSecretKey).toString();

                        let token = jwt_token.sign({ token: setEncryptedData }, req.app.config.jwtSecret, { expiresIn: "30d" });

                        res.json({
                          status: true,
                          message: "Successfuly loggedin.",
                          Records: [{
                            user_status: users[0].user_status,
                            token: "Bearer " + token,
                            user_name: users[0].user_name,
                            user_email: users[0].user_email,
                            user_pic: req.app.config.host_name + users[0].user_pic,
                            role_name: users[0].role_name
                          }]
                        });
                      }
                    })
                  }
                })
              }
            } else {
              return res.status(200).json({
                status: false,
                message: "Invalid password",
                Records: [],
                error: bcrypt_err,
              });
            }
          });

        } else {
          res.status(200).json({
            status: false,
            message: "No user found",
            Records: [],
            error: "No user found"
          });
        }
      }
    })
  }
}

function validatePhone(user_mobile) {
  let phone_regex = /^(\+?91|0)?[6789]\d{9}$/
  user_mobile = String(user_mobile);
  //check for length
  if (user_mobile.length < 8 || user_mobile.length > 13) {
    return false
  } else {

    //Check with regex
    if (user_mobile.match(phone_regex)) {

      //Take out the mobile no without country code
      let mobile_without_code = user_mobile.substr(user_mobile.length - 10)

      //return with country code(India)
      return user_mobile = `91${mobile_without_code}`;
    } else {
      return false
    }
  }
}

//@route    POST 5500/app/user/current-user
//@desc     Get the registered current user
//@access   Private
module.exports.CurrentUser = function (req, res) {
  //Check for JWT token if expires then show expiry msg
  if (req.user_info.status == false) {
    //Error message to app
    return res.status(403).json({ status: req.user_info.status, message: req.user_info.message, Records: [], error: req.user_info.message });
  } else {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let message = errors.hasOwnProperty('errors') && errors.errors.length > 0 ? errors.errors : [{ msg: '!Something went wrong' }];
      return res.status(200).json({ status: false, message: message[0].msg, errors: errors.array(), Records: [] });
    } else {
      res.status(200).json({ status: true, message: "Current user", Records: [req.user_info], error: null })
    }
  }
}
