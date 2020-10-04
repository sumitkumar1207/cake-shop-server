let moment = require('moment');
const { validationResult } = require('express-validator');
const { ErrorHandler } = require('@/helpers/error')
let sql = require('@/app/db/database')
let keys = require('@/app/config/keys')
import { sqlPaginate, sqlTableCount } from '@/app/helpers/collection';

//@route    POST 5500/app/order/place-order
//@desc     Place order by user
//@access   Private
module.exports.PlaceOrder = function (req, res) {
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
      let { cake_id, no_of_cakes, order_cancelled } = req.body;

      let order_payload = {
        user_id: req["user_info"]["user_id"] || 0,
        cake_id,
        no_of_cakes,
        order_cancelled,
        order_created_date: new Date(),
        order_created_by: req["user_info"]["user_id"] || 0,
        order_modified_date: new Date(),
        order_modified_by: req["user_info"]["user_id"] || 0,
        order_is_active: "Y"
      }
      /**
       * Search for same order.
      */
      let is_order_exists = `SELECT * FROM user_order WHERE user_id='${order_payload["user_id"]}' AND cake_id='${order_payload["cake_id"]}' AND order_cancelled='${order_payload["order_cancelled"]}' AND order_is_active='Y'`;
      sql.query(is_order_exists, (find_err, order_exists) => {
        if (find_err) {
          return res.status(200).json({ status: false, message: "SQL find error", Records: [], error: find_err })
        } else if (order_exists && order_exists.length > 0) {
          //Same cake name found
          return res.status(200).json({ status: true, message: "Order already placed!", Records: [], error: null })
        } else {
          //Save the new cake
          let place_order = `INSERT INTO user_order SET ?`;
          sql.query(place_order, order_payload, (place_err, new_order) => {
            if (place_err) {
              return res.status(200).json({ status: false, message: "SQL insert error", Records: [], error: place_err })
            } else {
              return res.status(200).json({ status: true, message: "Order placed!", Records: [], error: null })
            }
          })
        }
      });
    }
  }
}

//@route    POST 5500/app/order/cancel-order/:order_id
//@desc     Cancel order with the help of the order id.
//@access   Private
module.exports.CancelOrder = async function (req, res) {
  //Check for JWT token if expires then show expiry msg
  if (req.user_info.status == false) {
    //Error message to app
    return res.status(403).json({ status: req.user_info.status, message: req.user_info.message, error: req.user_info.message, Records: [] });
  } else {
    let { order_id } = req.params;
    let { cake_id, order_cancelled } = req.body;
    //If user wants cancel the order then it should 0 in db
    order_cancelled = parseInt(order_cancelled) > 0 ? 0 : 1;
    let user_id = req["user_info"]["user_id"] || 0;
    //Check for valid order id
    if (order_id && parseInt(order_id) > 0) {
      let find_query = `
      SELECT 
      uo.order_id,
      uo.user_id,
      uo.cake_id,
      uo.order_cancelled,
      uo.cake_is_active
      FROM user_order uo
      WHERE uo.order_id='${order_id}' AND user_id='${user_id}' AND cake_id='${cake_id}' AND order_cancelled='${order_cancelled}' AND uo.order_is_active='Y'`

      //Query to DB
      sql.query(find_query, (err, order) => {
        if (err) {
          return res.status(200).json({ status: false, message: "SQL error while finding records", error: err, Records: [] });
        } else if (order && order.length > 0) {

          let update_payload = {
            order_cancelled,
            order_modified_date: moment().format('YYYY-MM-DD HH:mm:ss'),
            order_modified_by: req["user_info"]["user_id"]
          }
          let update_query = `UPDATE user_order SET ? WHERE order_id='${order_id}' AND order_is_active='Y'`;
          sql.query(update_query, update_payload, (upd_err, updated) => {
            if (upd_err) {
              return res.status(200).json({ status: false, message: `SQL update error`, Records: [], error: upd_err });
            } else {
              return res.status(200).json({ status: true, message: `Order cancelled!`, Records: [], error: null });
            }
          })
        } else {
          return res.status(200).json({ status: true, message: `No order found!`, Records: [], error: null });
        }
      })
    } else {
      return res.status(200).json({ status: false, message: `Invalid order id!`, Records: [], error: true });
    }
  }
}

//@route    PUT 5500/app/order/update-order/:order_id
//@desc     Update order with the help of order id.
//@access   Private
module.exports.UpdateOrder = async function (req, res) {
  //Check for JWT token if expires then show expiry msg
  if (req.user_info.status == false) {
    //Error message to app
    return res.status(403).json({ status: req.user_info.status, message: req.user_info.message, error: req.user_info.message, Records: [] });
  } else {
    let { order_id } = req.params;
    let { cake_id, no_of_cakes } = req.body;
    let user_id = req["user_info"]["user_id"] || 0;
    //Check for valid order id
    if (order_id && parseInt(order_id) > 0) {
      let find_query = `
      SELECT 
      uo.order_id,
      uo.user_id,
      uo.cake_id,
      uo.order_cancelled,
      uo.no_of_cakes,
      uo.cake_is_active
      FROM user_order uo
      WHERE uo.order_id='${order_id}' AND user_id='${user_id}' AND cake_id='${cake_id}' AND order_cancelled='0' AND uo.order_is_active='Y'`

      //Query to DB
      sql.query(find_query, (err, order) => {
        if (err) {
          return res.status(200).json({ status: false, message: "SQL error while finding records", error: err, Records: [] });
        } else if (order && order.length > 0) {

          let update_payload = {
            no_of_cakes: parseInt(no_of_cakes) > 0 ? parseInt(no_of_cakes) : 1,
            order_modified_date: moment().format('YYYY-MM-DD HH:mm:ss'),
            order_modified_by: req["user_info"]["user_id"]
          }
          let update_query = `UPDATE user_order SET ? WHERE order_id='${order_id}' AND order_is_active='Y'`;
          sql.query(update_query, update_payload, (upd_err, updated) => {
            if (upd_err) {
              return res.status(200).json({ status: false, message: `SQL update error`, Records: [], error: upd_err });
            } else {
              return res.status(200).json({ status: true, message: `Order updated!`, Records: [], error: null });
            }
          })
        } else {
          return res.status(200).json({ status: true, message: `No order found!`, Records: [], error: null });
        }
      })
    } else {
      return res.status(200).json({ status: false, message: `Invalid order id!`, Records: [], error: true });
    }
  }
}

//@route    GET 5500/app/order/get-user-orders/:user_id
//@desc     Get all orders by user id.
//@access   Private
module.exports.GetUserOrders = async function (req, res) {
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
      let { user_id } = req.params
      /**
       * Count the total records which are active and related to that user.
       */
      let counts = await sqlTableCount(`SELECT COUNT(*) as count FROM user_order WHERE order_is_active='Y' AND user_id='${user_id}'`);

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
      uo.order_id,
      uo.cake_id,
      uo.no_of_cakes,
      ck.cake_name,
      ck.cake_description,
      ck.cake_price,
      ck.cake_image,
      ck.cake_is_active,
      CONCAT('${req.app.config.host_name}',ck.cake_image ) AS cake_url,
      DATE_FORMAT(ck.cake_created_at,'%d/%m/%Y') AS createdAt,
      TIME_FORMAT(ck.cake_created_at,'%h:%i %p') AS createdTime,
      un.unit_id,
      un.unit_name,
      un.unit_value,
      CONCAT( CAST(CAST(un.unit_value AS decimal(18,5)) AS float), unit_name) AS display_unit
      FROM user_order uo
      LEFT JOIN cake ck ON ck.cake_id=uo.cake_id
      LEFT JOIN unit un ON un.unit_id=ck.unit_id
      LEFT JOIN user u ON u.user_id=uo.user_id
      WHERE uo.order_is_active='Y' AND uo.user_id='${user_id}' ORDER BY uo.cake_id DESC ${paginate}`

      //Query to DB
      sql.query(find_query, (err, orders) => {
        if (err) {
          return res.status(200).json({ status: false, message: "SQL error while finding records", error: err, Records: [] });
        } else if (orders && orders.length > 0) {
          return res.status(200).json({
            status: true, message: `Get all orders successfully!`, Records: orders, counts: counts, error: null
          });
        } else {
          return res.status(200).json({
            status: true, message: `No orders found!`, Records: orders, counts: counts, error: null
          });
        }
      })
    }
  }
}
