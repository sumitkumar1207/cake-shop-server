const express = require('express')
const router = express.Router();

const UnitController = require('@/controller/UnitController/UnitController');
const { isAuthorizedUser } = require('@/app/middleware/auth');
const roles = require('@/app/helpers/permission');
//Add new Unit route
router.route('/add-unit')
  .post(isAuthorizedUser([roles.admin, roles.super_admin]), UnitController.AddUnit)
//Update the unit info
router.route('/edit-unit/:unit_id')
  .put(isAuthorizedUser([roles.admin, roles.super_admin]), UnitController.UpdateUnit)
//Get all the units
router.route('/get-units')
  .get(isAuthorizedUser([roles.admin, roles.super_admin]), UnitController.GetUnits)
//Get the unit detail from unit id
router.route('/get-unit/:unit_id')
  .get(isAuthorizedUser([roles.admin, roles.super_admin]), UnitController.GetUnitByUnitId)
//Flag the unit
router.route('/delete-unit/:unit_id')
  .delete(isAuthorizedUser([roles.admin, roles.super_admin]), UnitController.DeleteUnitByUnitId)

module.exports = router
