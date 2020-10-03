let moment = require('moment');
const { validationResult } = require('express-validator');
const { ErrorHandler } = require('@/helpers/error')
let sql = require('@/app/db/database')
let keys = require('@/app/config/keys')
import { sqlPaginate, sqlTableCount } from '@/app/helpers/collection';

//@route    POST 5500/admin/unit/add-unit
//@desc     Add Unit
//@access   Private
module.exports.AddUnit = function (req, res) {
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
      let { unit_name, unit_value } = req.body;
      //Remove white spaces and replace with single space
      unit_name = unit_name.replace(/  +/g, ' ');

      let unit_payload = {
        unit_name,
        unit_value,
        unit_created_by: req["user_info"]["user_id"] || 0,
        unit_created_date: new Date(),
        unit_modified_by: req["user_info"]["user_id"] || 0,
        unit_modified_date: new Date(),
        unit_is_active: "Y"
      }
      /**
       * Search for same unit name.
      */
      let is_unit_exists = `SELECT unit_name,unit_value FROM unit WHERE unit_name='${unit_payload["unit_name"]}' AND unit_value='${unit_payload["unit_value"]}' AND unit_is_active='Y'`;
      sql.query(is_unit_exists, (find_err, unit_exists) => {
        if (find_err) {
          return res.status(200).json({ status: false, message: "SQL find error", Records: [], error: find_err })
        } else if (unit_exists && unit_exists.length > 0) {
          //Same unit name found
          return res.status(200).json({ status: true, message: "unit name already exists!", Records: [], error: null })
        } else {
          //Save the new unit
          let insert_unit = `INSERT INTO unit SET ?`;
          sql.query(insert_unit, unit_payload, (insert_err, new_unit) => {
            if (insert_err) {
              return res.status(200).json({ status: false, message: "SQL insert error", Records: [], error: insert_err })
            } else {
              return res.status(200).json({ status: true, message: "New unit added!", Records: [], error: null })
            }
          })
        }
      });
    }
  }
}

//@route    GET 5500/admin/unit/get-units
//@desc     Get all Units
//@access   Private
module.exports.GetUnits = async function (req, res) {
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
      let counts = await sqlTableCount(`SELECT COUNT(*) as count FROM unit WHERE unit_is_active='Y'`);

      /**
       * Pass the query parameter to the helper function.
       */
      let paginate = sqlPaginate(req.query);

      /**
       * Add the host name in the url of unit.
       * Format the date.
       * Add the server time.   
       */
      // TIME_FORMAT(CONVERT_TZ(un.unit_created_date,'+00:00','+05:30'),'%h:%i %p') AS createdTime,
      // CONVERT_TZ(un.unit_created_date,'+00:00','+05:30') AS convertedDateAndTime
      let find_query = `
      SELECT 
      un.unit_id,
      un.unit_name,
      un.unit_value,
      un.unit_created_date,
      un.unit_modified_date,
      un.unit_is_active,
      DATE_FORMAT(un.unit_created_date,'%d/%m/%Y') AS createdAt,
      TIME_FORMAT(un.unit_created_date,'%h:%i %p') AS createdTime
      FROM unit un
      WHERE un.unit_is_active='Y' ORDER BY un.unit_id DESC ${paginate}`

      //Query to DB
      sql.query(find_query, (err, units) => {
        if (err) {
          return res.status(200).json({ status: false, message: "SQL error while finding records", error: err, Records: [] });
        } else if (units && units.length > 0) {
          return res.status(200).json({
            status: true, message: `Get all units successfully!`, Records: units, counts: counts, error: null
          });
        } else {
          return res.status(200).json({
            status: true, message: `No units found!`, Records: units, counts: counts, error: null
          });
        }
      })
    }
  }
}

//@route    GET 5500/admin/unit/get-unit/:unit_id
//@desc     Get Unit with the help of unit id.
//@access   Private
module.exports.GetUnitByUnitId = async function (req, res) {
  //Check for JWT token if expires then show expiry msg
  if (req.user_info.status == false) {
    //Error message to app
    return res.status(403).json({ status: req.user_info.status, message: req.user_info.message, error: req.user_info.message, Records: [] });
  } else {
    let { unit_id } = req.params;
    //Check for valid unit id
    if (unit_id && parseInt(unit_id) > 0) {
      let find_query = `
      SELECT 
      un.unit_id,
      un.unit_name,
      un.unit_value,
      un.unit_created_date,
      un.unit_modified_date,
      un.unit_is_active,
      DATE_FORMAT(un.unit_created_at,'%d/%m/%Y') AS createdAt,
      TIME_FORMAT(un.unit_created_at,'%h:%i %p') AS createdTime
      FROM unit un
      WHERE un.unit_id='${unit_id}' AND un.unit_is_active='Y'`

      //Query to DB
      sql.query(find_query, (err, unit) => {
        if (err) {
          return res.status(200).json({ status: false, message: "SQL error while finding records", error: err, Records: [] });
        } else if (unit && unit.length > 0) {
          return res.status(200).json({
            status: true, message: `Get unit successfully!`, Records: unit, error: null
          });
        } else {
          return res.status(200).json({ status: true, message: `No unit found!`, Records: unit, error: null });
        }
      })
    } else {
      return res.status(200).json({ status: false, message: `Invalid unit id!`, Records: [], error: true });
    }
  }
}

//@route    PUT 5500/admin/unit/get-unit/:unit_id
//@desc     Get unit with the help of unit id.
//@access   Private
module.exports.UpdateUnit = async function (req, res) {
  //Check for JWT token if expires then show expiry msg
  if (req.user_info.status == false) {
    //Error message to app
    return res.status(403).json({ status: req.user_info.status, message: req.user_info.message, error: req.user_info.message, Records: [] });
  } else {
    let { unit_id } = req.params;
    let { unit_name, unit_value } = req.body;
    //Remove white spaces and replace with single space
    unit_name = unit_name.replace(/  +/g, ' ');

    //Check for valid unit id
    if (unit_id && parseInt(unit_id) > 0) {
      let find_query = `
      SELECT 
      un.unit_id,
      un.unit_name,
      un.unit_value,
      un.unit_created_date,
      un.unit_modified_date,
      un.unit_is_active,
      DATE_FORMAT(un.unit_created_at,'%d/%m/%Y') AS createdAt,
      TIME_FORMAT(un.unit_created_at,'%h:%i %p') AS createdTime
      FROM unit un
      WHERE un.unit_id='${unit_id}' AND un.unit_is_active='Y'`

      //Query to DB
      sql.query(find_query, (err, unit) => {
        if (err) {
          return res.status(200).json({ status: false, message: "SQL error while finding records", error: err, Records: [] });
        } else if (unit && unit.length > 0) {

          let update_payload = {
            unit_name: unit_name.trim().length > 0 ? unit_name : unit[0]["unit_name"],
            unit_value: unit_value || unit[0]["unit_value"],
            unit_modified_date: moment().format('YYYY-MM-DD HH:mm:ss'),
            unit_modified_by: req["user_info"]["user_id"]
          }
          let update_query = `UPDATE unit SET ? WHERE unit_id='${unit_id}' AND unit_is_active='Y'`;
          sql.query(update_query, update_payload, (upd_err, updated) => {
            if (upd_err) {
              return res.status(200).json({ status: false, message: `SQL update error`, Records: [], error: upd_err });
            } else {
              return res.status(200).json({ status: true, message: `unit info updated!`, Records: [], error: null });
            }
          })
        } else {
          return res.status(200).json({ status: true, message: `No unit found!`, Records: unit, error: null });
        }
      })
    } else {
      return res.status(200).json({ status: false, message: `Invalid unit id!`, Records: [], error: true });
    }
  }
}

//@route    DELETE 5500/admin/unit/delete-unit/:unit_id
//@desc     Delete unit with the help of unit id.
//@access   Private
module.exports.DeleteUnitByUnitId = async function (req, res) {
  //Check for JWT token if expires then show expiry msg
  if (req.user_info.status == false) {
    //Error message to app
    return res.status(403).json({ status: req.user_info.status, message: req.user_info.message, error: req.user_info.message, Records: [] });
  } else {
    let { unit_id } = req.params;
    //Check for valid unit id
    if (unit_id && parseInt(unit_id) > 0) {
      let find_query = `
      SELECT un.unit_id
      FROM unit un
      WHERE un.unit_id='${unit_id}' AND un.unit_is_active='Y'`

      //Query to DB
      sql.query(find_query, (err, unit) => {
        if (err) {
          return res.status(200).json({ status: false, message: "SQL error while finding records", error: err, Records: [] });
        } else if (unit && unit.length > 0) {
          //Flag the unit to "N"
          let unit_modified_date = moment().format('YYYY-MM-DD HH:mm:ss')
          let unit_modified_by = req['user_info']['user_id']
          let unit_is_active = "N"

          let delete_query = `UPDATE unit SET unit_is_active='${unit_is_active}',unit_modified_by='${unit_modified_by}',unit_modified_date='${unit_modified_date}' WHERE  unit_id='${unit_id}' AND unit_is_active= 'Y' `;
          sql.query(delete_query, (error) => {
            if (error) {
              return res.status(400).json({ status: false, message: 'None found', error: error, Records: [] })
            } else {
              return res.status(200).json({ status: true, message: `Requested unit removed successfully!`, error: null, Records: [] });
            }
          })
        } else {
          return res.status(200).json({ status: true, message: `No unit found!`, Records: unit, error: null });
        }
      })
    } else {
      return res.status(200).json({ status: false, message: `Invalid unit id!`, Records: [], error: true });
    }
  }
}
