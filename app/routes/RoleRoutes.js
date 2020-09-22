const express = require('express')
const router = express.Router();
const RoleController = require('@/app/controller/RoleController/RoleController')
const { isAuthorizedUser } = require('@/app/middleware/auth');
const roles = require('@/app/helpers/permission');

router.route('/add')
  .post(isAuthorizedUser([roles.super_admin]), RoleController.AddRole);

router.route('/edit/:role_id')
  .post(isAuthorizedUser([roles.super_admin]), RoleController.EditRole);

router.route('/:role_id') // all
  .get(isAuthorizedUser([roles.super_admin]), RoleController.GetUserRole)
  .delete(isAuthorizedUser([roles.super_admin]), RoleController.DeleteRole);

//Get roles when admin and super admin will add user
router.route('/get/user-roles')
  .get(isAuthorizedUser([roles.super_admin, roles.admin]), RoleController.GetUserRoleToAddUser);

module.exports = router
