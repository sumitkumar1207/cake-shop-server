const express = require('express')
const router = express.Router();

const CakeConteroller = require('@/controller/CakeController/CakeController');
const { isAuthorizedUser } = require('@/app/middleware/auth');
const roles = require('@/app/helpers/permission');

router.route('/add-cake')
  .post(isAuthorizedUser([roles.admin, roles.super_admin]), CakeConteroller.AddCake)

module.exports = router
