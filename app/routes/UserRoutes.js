const express = require('express')
const router = express.Router();

const UserValidations = require('@/app/expressValidator/UserValidations')
const UserConteroller = require('@/controller/UserController/UserController');
const { isAuthorizedUser } = require('@/app/middleware/auth');
const roles = require('@/app/helpers/permission');

router.route('/register')
  .post(UserValidations.validate('registerUser'), UserConteroller.Register)

router.route('/login')
  .post(UserValidations.validate('loginUser'), UserConteroller.Login);

router.route('/current-user')
  .get(isAuthorizedUser(), UserConteroller.CurrentUser);

module.exports = router
