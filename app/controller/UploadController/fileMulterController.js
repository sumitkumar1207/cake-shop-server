const path = require("path");
const AWS = require('aws-sdk');
const fs = require("fs");
let s3 = require('@auth0/s3');
const async = require("async");
let sql = require('@/app/db/database')

const BASEURL = global.config.host_name;

let { uploadImage } = require('@/middleware/uploadFile')

//@route    POST 5500/api/upload-image
//@desc     Upload image file.
//@access   Public/Private
module.exports.uploadImageController = function (req, res) {
  //Check for JWT token if expires then show expiry msg
  if (req.user_info.status == false) {
    //Error message to app
    return res.status(403).json({ status: req.user_info.status, message: req.user_info.message, Records: [], error: req.user_info.message });
  } else {
    uploadImage(req, res, function (uploadImageError) {
      if (uploadImageError) {
        res.json({ status: false, message: uploadImageError, Records: [], error: uploadImageError });
      } else {
        let uploaded_urls = []
        let mediaPath = req.body.mediaPath
        if (req.files && req.files.length > 0) {
          async.each(req.files, function (file, async_callback) {

            file.originalname = uniqueFileName(file.originalname);

            let checkpath = path.normalize(`${__base}/public${mediaPath}`);

            if (!fs.existsSync(checkpath)) {
              fs.mkdirSync(checkpath, { recursive: true });
            }

            let og_name = file.originalname.split(".");

            let ext = og_name[1].toLowerCase();

            let newFileName = `${Date.now()}-${og_name[0] + "." + ext}`;

            let storeInfo = `${mediaPath}${newFileName}`;

            let existingFile = `${__base}/public/uploads/${file.filename}`;

            fs.rename(existingFile, `${__base}/public${storeInfo}`, error => {
              if (error) {
                async_callback()
              } else {
                if (req.app.config.uploadType == 'aws') {
                  uploadToS3(mediaPath, newFileName, (s3error, result) => {
                    if (s3error) {
                      callback()
                    } else {
                      fs.unlink(`${__base}/public${storeInfo}`, function (error) { });

                      //Call the func to store the ulr
                      // saveMediaUrlToDb(req, result)

                      let uploaded_file = `${result}`
                      let _obj = { path: uploaded_file }

                      uploaded_urls.push(_obj)

                      async_callback()
                    }
                  });
                } else {

                  //Call the func to store the ulr
                  // saveMediaUrlToDb(req, storeInfo)
                  // let uploaded_file = `${__base}/public${storeInfo}`
                  let uploaded_file = `${storeInfo}`
                  let _obj = { path: uploaded_file, base_url: BASEURL }

                  uploaded_urls.push(_obj)

                  async_callback()
                }
              }
            });
          }, function (async_err) {
            if (async_err) {
              res.json({ status: false, message: "Image uploading Error", error: async_err, Records: [] });
            } else {
              res.json({ status: true, message: "Image uploaded successfully", Records: uploaded_urls, error: null })
            }
          })
        } else {
          res.json({ status: false, message: "Please select at least one file", error: null, Records: [] });
        }
      }
    });
  }
};

/**
 * Function to upload the file to the s3
 */
const uploadToS3 = (dirPath, OGfileName, callback) => {
  let folder = path.normalize(`${__base}/public${dirPath}`);
  let fileName = OGfileName.replace(/[/\\?%*:|"<>]/g, '-');
  let FinalUploadImagePath = `S3${dirPath}${fileName}`

  let params = {
    localFile: folder + OGfileName,
    s3Params: {
      Bucket: global.config.uploadCredential.awsConfig.bucketName,
      Key: FinalUploadImagePath // `S3${dirPath}${fileName}`,
    },
  };

  const awsS3Client = new AWS.S3(global.config.uploadCredential.awsConfig);
  let client = s3.createClient({
    s3Client: awsS3Client,
    maxAsyncS3: 20, // this is the default
    s3RetryCount: 3, // this is the default
    s3RetryDelay: 1000, // this is the default
    multipartUploadThreshold: 20971520, // this is the default (20 MB)
    multipartUploadSize: 15728640, // this is the default (15 MB)
  });
  let uploader = client.uploadFile(params);

  uploader.on('progress', function () {
    // console.log('progress', uploader.progressMd5Amount, uploader.progressAmount, uploader.progressTotal);
  });
  uploader.on('error', function (error) {
    console.error('unable to upload:', error.stack);
    callback(error, null);
  });
  uploader.on('end', function () {
    callback(null, `/${FinalUploadImagePath}`);
  });
}

/**
 * Function for making file name unique with file extension
 */
const uniqueFileName = (file_name) => {
  var a = file_name;
  let file_extensions_only = (a.split(/[. ]+/).pop());
  let without_ext_file_name = a.split('.').slice(0, -1).join('.');
  let without_special_char_file_name = without_ext_file_name.toLowerCase().split(' ').join('_').replace(/[^a-z0-9_]/gi, '');
  var final_file_name_with_ext = without_special_char_file_name.concat('.', file_extensions_only);
  file_name = final_file_name_with_ext
  return file_name
}

/**
 * For the cakes:-    /uploads/cakes/
*/