const express = require('express')
const router = express.Router();

const CakeConteroller = require('@/controller/CakeController/CakeController');
const { isAuthorizedUser } = require('@/app/middleware/auth');
const roles = require('@/app/helpers/permission');
//Add new cake route
router.route('/add-cake')
  .post(isAuthorizedUser([roles.admin, roles.super_admin]), CakeConteroller.AddCake)
//Get all the cakes
router.route('/get-cakes')
  .get(isAuthorizedUser(), CakeConteroller.GetCakes)
//Get the cake detail from cake id
router.route('/get-cake/:cake_id')
  .get(isAuthorizedUser(), CakeConteroller.GetCakeByCakeId)
//Flag the cake
router.route('/delete-cake/:cake_id')
  .delete(isAuthorizedUser(), CakeConteroller.DeleteCakeByCakeId)

module.exports = router
