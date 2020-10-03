const express = require('express')
const router = express.Router();
const { isAuthorizedUser } = require('@/app/middleware/auth');

const UploadMulter = require('@/controller/UploadController/fileMulterController');

router.route("/upload-image")
  .post(isAuthorizedUser(), UploadMulter.uploadImageController)

module.exports = router
