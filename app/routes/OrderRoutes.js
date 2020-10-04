const express = require('express')
const router = express.Router();

const OrderController = require('@/controller/OrderController/OrderController');
const { isAuthorizedUser } = require('@/app/middleware/auth');
const roles = require('@/app/helpers/permission');
//Place new order
router.route('/place-order')
  .post(isAuthorizedUser(), OrderController.PlaceOrder)
//Cancel order
router.route('/cancel-order/:order_id')
  .post(isAuthorizedUser(), OrderController.CancelOrder)
//Update order
router.route('/update-order/:order_id')
  .put(isAuthorizedUser(), OrderController.UpdateOrder)
//Get orders by user id
router.route('/get-user-orders/:user_id')
  .get(isAuthorizedUser(), OrderController.GetUserOrders)

module.exports = router;