let moment = require('moment');
const { validationResult } = require('express-validator');
const { ErrorHandler } = require('@/helpers/error')
let sql = require('@/app/db/database')
let keys = require('@/app/config/keys')
import { sqlPaginate, sqlTableCount } from '@/app/helpers/collection';

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
      //Pull all the keys from body
      let { cake_name, cake_description, cake_price, cake_image, unit_id } = req.body;
      //Remove white spaces and replace with single space
      cake_name = cake_name.replace(/  +/g, ' ');
      cake_description = cake_description.replace(/  +/g, ' ');

      let cake_payload = {
        unit_id,
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

//@route    GET 5500/app/cake/get-cakes
//@desc     Get all Cakes
//@access   Private
module.exports.GetCakes = async function (req, res) {
  //Check for JWT token if expires then show expiry msg
  if (req.user_info.status == false) {
    //Error message to app
    return res.status(403).json({ status: req.user_info.status, message: req.user_info.message, error: req.user_info.message, Records: [] });
  } else {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let message = errors.hasOwnProperty('errors') && errors.errors.length > 0 ? errors.errors : [{ msg: '!Something went wrong' }];
      return res.status(200).json({ status: false, message: message[0].msg, errors: errors.array(), Records: [] });
    } else {

      /**
       * Count the total records which are active.
       */
      let counts = await sqlTableCount(`SELECT COUNT(*) as count FROM cake WHERE cake_is_active='Y'`);

      /**
       * Pass the query parameter to the helper function.
       */
      let paginate = sqlPaginate(req.query);

      /**
       * Add the host name in the url of cake.
       * Format the date.
       * Add the server time.   
       */
      // TIME_FORMAT(CONVERT_TZ(ck.cake_created_at,'+00:00','+05:30'),'%h:%i %p') AS createdTime,
      // CONVERT_TZ(ck.cake_created_at,'+00:00','+05:30') AS convertedDateAndTime
      let find_query = `
      SELECT 
      ck.cake_id,
      ck.unit_id,
      ck.cake_name,
      ck.cake_description,
      ck.cake_price,
      ck.cake_image,
      ck.cake_created_at,
      ck.cake_modified_at,
      ck.cake_is_active,
      CONCAT('${req.app.config.host_name}',ck.cake_image ) AS cake_url,
      DATE_FORMAT(ck.cake_created_at,'%d/%m/%Y') AS createdAt,
      TIME_FORMAT(ck.cake_created_at,'%h:%i %p') AS createdTime,
      un.unit_name,
      un.unit_value,
      CONCAT( CAST(CAST(un.unit_value AS decimal(18,5)) AS float), unit_name) AS display_unit
      FROM cake ck
      LEFT JOIN unit un ON un.unit_id=ck.unit_id
      WHERE ck.cake_is_active='Y' ORDER BY ck.cake_id DESC ${paginate}`

      //Query to DB
      sql.query(find_query, (err, cakes) => {
        if (err) {
          return res.status(200).json({ status: false, message: "SQL error while finding records", error: err, Records: [] });
        } else if (cakes && cakes.length > 0) {
          return res.status(200).json({
            status: true, message: `Get all cakes successfully!`, Records: cakes, counts: counts, error: null
          });
        } else {
          return res.status(200).json({
            status: true, message: `No cakes found!`, Records: cakes, counts: counts, error: null
          });
        }
      })
    }
  }
}

//@route    GET 5500/app/cake/get-cake/:cake_id
//@desc     Get Cake with the help of cake id.
//@access   Private
module.exports.GetCakeByCakeId = async function (req, res) {
  //Check for JWT token if expires then show expiry msg
  if (req.user_info.status == false) {
    //Error message to app
    return res.status(403).json({ status: req.user_info.status, message: req.user_info.message, error: req.user_info.message, Records: [] });
  } else {
    let { cake_id } = req.params;
    //Check for valid cake id
    if (cake_id && parseInt(cake_id) > 0) {
      let find_query = `
      SELECT 
      ck.cake_id,
      ck.unit_id,
      ck.cake_name,
      ck.cake_description,
      ck.cake_price,
      ck.cake_image,
      ck.cake_created_at,
      ck.cake_modified_at,
      ck.cake_is_active,
      CONCAT('${req.app.config.host_name}',ck.cake_image ) AS cake_url,
      DATE_FORMAT(ck.cake_created_at,'%d/%m/%Y') AS createdAt,
      TIME_FORMAT(ck.cake_created_at,'%h:%i %p') AS createdTime,
      un.unit_name,
      un.unit_value,
      CONCAT( CAST(CAST(un.unit_value AS decimal(18,5)) AS float), unit_name) AS display_unit
      FROM cake ck
      LEFT JOIN unit un ON un.unit_id=ck.unit_id
      WHERE ck.cake_id='${cake_id}' AND ck.cake_is_active='Y'`

      //Query to DB
      sql.query(find_query, (err, cake) => {
        if (err) {
          return res.status(200).json({ status: false, message: "SQL error while finding records", error: err, Records: [] });
        } else if (cake && cake.length > 0) {
          return res.status(200).json({
            status: true, message: `Get cake successfully!`, Records: cake, error: null
          });
        } else {
          return res.status(200).json({ status: true, message: `No cake found!`, Records: cake, error: null });
        }
      })
    } else {
      return res.status(200).json({ status: false, message: `Invalid cake id!`, Records: [], error: true });
    }
  }
}

//@route    PUT 5500/app/cake/get-cake/:cake_id
//@desc     Get Cake with the help of cake id.
//@access   Private
module.exports.UpdateCake = async function (req, res) {
  //Check for JWT token if expires then show expiry msg
  if (req.user_info.status == false) {
    //Error message to app
    return res.status(403).json({ status: req.user_info.status, message: req.user_info.message, error: req.user_info.message, Records: [] });
  } else {
    let { cake_id } = req.params;
    let { cake_name, cake_description, cake_price, unit_id } = req.body;
    //Remove white spaces and replace with single space
    cake_name = cake_name.replace(/  +/g, ' ');
    cake_description = cake_description.replace(/  +/g, ' ');

    //Check for valid cake id
    if (cake_id && parseInt(cake_id) > 0) {
      let find_query = `
      SELECT 
      ck.cake_id,
      ck.unit_id,
      ck.cake_name,
      ck.cake_description,
      ck.cake_image,
      ck.cake_created_at,
      ck.cake_modified_at,
      ck.cake_is_active,
      CONCAT('${req.app.config.host_name}',ck.cake_image ) AS cake_url,
      DATE_FORMAT(ck.cake_created_at,'%d/%m/%Y') AS createdAt,
      TIME_FORMAT(ck.cake_created_at,'%h:%i %p') AS createdTime
      FROM cake ck
      WHERE ck.cake_id='${cake_id}' AND ck.cake_is_active='Y'`

      //Query to DB
      sql.query(find_query, (err, cake) => {
        if (err) {
          return res.status(200).json({ status: false, message: "SQL error while finding records", error: err, Records: [] });
        } else if (cake && cake.length > 0) {

          let update_payload = {
            unit_id: parseInt(unit_id) > 0 ? unit_id : cake[0]["unit_id"],
            cake_name: cake_name.trim().length > 0 ? cake_name : cake[0]["cake_name"],
            cake_description: cake_description.trim().length > 0 ? cake_description : cake[0]["cake_description"],
            cake_price: cake_price || cake[0]["cake_price"],
            cake_modified_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            cake_modified_by: req["user_info"]["user_id"]
          }
          let update_query = `UPDATE cake SET ? WHERE cake_id='${cake_id}' AND cake_is_active='Y'`;
          sql.query(update_query, update_payload, (upd_err, updated) => {
            if (upd_err) {
              return res.status(200).json({ status: false, message: `SQL update error`, Records: [], error: upd_err });
            } else {
              return res.status(200).json({ status: true, message: `Cake info updated!`, Records: [], error: null });
            }
          })
        } else {
          return res.status(200).json({ status: true, message: `No cake found!`, Records: cake, error: null });
        }
      })
    } else {
      return res.status(200).json({ status: false, message: `Invalid cake id!`, Records: [], error: true });
    }
  }
}

//@route    DELETE 5500/app/cake/delete-cake/:cake_id
//@desc     Delete Cake with the help of cake id.
//@access   Private
module.exports.DeleteCakeByCakeId = async function (req, res) {
  //Check for JWT token if expires then show expiry msg
  if (req.user_info.status == false) {
    //Error message to app
    return res.status(403).json({ status: req.user_info.status, message: req.user_info.message, error: req.user_info.message, Records: [] });
  } else {
    let { cake_id } = req.params;
    //Check for valid cake id
    if (cake_id && parseInt(cake_id) > 0) {
      let find_query = `
      SELECT ck.cake_id
      FROM cake ck
      WHERE ck.cake_id='${cake_id}' AND ck.cake_is_active='Y'`

      //Query to DB
      sql.query(find_query, (err, cake) => {
        if (err) {
          return res.status(200).json({ status: false, message: "SQL error while finding records", error: err, Records: [] });
        } else if (cake && cake.length > 0) {
          //Flag the cake to "N"
          let cake_modified_at = moment().format('YYYY-MM-DD HH:mm:ss')
          let cake_modified_by = req['user_info']['user_id']
          let cake_is_active = "N"

          let delete_query = `UPDATE cake SET cake_is_active='${cake_is_active}',cake_modified_by='${cake_modified_by}',cake_modified_at='${cake_modified_at}' WHERE  cake_id='${cake_id}' AND cake_is_active= 'Y' `;
          sql.query(delete_query, (error) => {
            if (error) {
              return res.status(400).json({ status: false, message: 'None found', error: error, Records: [] })
            } else {
              return res.status(200).json({ status: true, message: `Requested cake removed successfully!`, error: null, Records: [] });
            }
          })
        } else {
          return res.status(200).json({ status: true, message: `No cake found!`, Records: cake, error: null });
        }
      })
    } else {
      return res.status(200).json({ status: false, message: `Invalid cake id!`, Records: [], error: true });
    }
  }
}
