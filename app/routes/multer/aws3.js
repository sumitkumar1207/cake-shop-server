const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const uuidV4 = require('uuid/v4')

const uploadCredential = require('@/app/config/keys').uploadCredential.awsConfig

aws.config.update({
  secretAccessKey: uploadCredential.secretAccessKey,
  accessKeyId: uploadCredential.accessKeyId,
  region: uploadCredential.region,
  ACL: uploadCredential.ACL
})
const s3 = new aws.S3();

const fileFilter = (req, file) => {

}

const uploads3 = multer({
  fileFilter,
  storage: multerS3({
    s3: s3,
    bucket: uploadCredential.bucketName,
    size: 1024 * 1024 * 10,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, callback) => {

      let getImageExtension = file.originalname.split('.')[file.originalname.split('.').length - 1]
      let defaultName = "CakeShop" + "_" + uuidV4();
      let ext = (getImageExtension == 'png' || getImageExtension == "PNG" || getImageExtension == "jpg" || getImageExtension == "JPG" || getImageExtension == "jpeg" || getImageExtension == "JPEG" || getImageExtension == "Jpg" || getImageExtension == "Jpeg") ? getImageExtension : '';

      let uniqueFileName = ext !== '' ? defaultName + "." + ext : defaultName

      cb(null, uniqueFileName)
    }
  })
})

//Function to check weather passed file is in AWS bucket or not.
const objectChecker = function (params, callback) {

  s3.headObject(params, (err, data) => {
    if (err && err.code === 'NotFound') {
      callback(false)
    } else if (err) {
      callback(err)
    } else {
      callback(data)
    }
  })
}

module.exports = { uploads3, objectChecker }