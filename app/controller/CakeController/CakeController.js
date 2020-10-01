const { validationResult } = require('express-validator');
const { ErrorHandler } = require('@/helpers/error')
let sql = require('@/app/db/database')
let keys = require('@/app/config/keys')

//@route    POST 5500/app/cake/add-cake
//@desc     Add Cake
//@access   Private
module.exports.AddCake = function (req, res) {
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
      console.log('req.body :>> ', req.body);
      //Pull all the keys from body
      // cake_id	cake_name	cake_description	cake_price	cake_image	cake_created_by	cake_created_at	cake_modified_by	cake_modified_at	cake_is_active

      let { cake_name, cake_description, cake_price, cake_image } = req.body;
      //Remove white spaces and replace with single space
      cake_name = cake_name.replace(/  +/g, ' ');
      cake_description = cake_description.replace(/  +/g, ' ');

      let cake_payload = {
        cake_name,
        cake_description,
        cake_price,
        cake_image: (cake_image && cake_image !== '') ? cake_image : "/assets/icons/default_cake.jpg",
        cake_created_by: req["user_info"]["user_id"] || 0,
        cake_created_at: new Date(),
        cake_modified_by: req["user_info"]["user_id"] || 0,
        cake_modified_at: new Date(),
        cake_is_active: "Y"
      }
      /**
       * Search for same cake name.
      */
      let is_cake_exists = `SELECT cake_name FROM cake WHERE cake_name='${cake_name}' AND cake_is_active='Y'`;
      sql.query(is_cake_exists, (find_err, cake_exists) => {
        if (find_err) {
          return res.status(200).json({ status: false, message: "SQL find error", Records: [], error: find_err })
        } else if (cake_exists && cake_exists.length > 0) {
          //Same cake name found
          return res.status(200).json({ status: true, message: "Cake name already exists!", Records: [], error: null })
        } else {
          //Save the new cake
          let insert_cake = `INSERT INTO cake SET ?`;
          sql.query(insert_cake, cake_payload, (insert_err, new_cake) => {
            if (insert_err) {
              return res.status(200).json({ status: false, message: "SQL insert error", Records: [], error: insert_err })
            } else {
              return res.status(200).json({ status: true, message: "New cake added!", Records: [], error: null })
            }
          })
        }
      });
    }
  }
}
