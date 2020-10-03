let path = require('path');
let multer = require("multer");
const fs = require("fs");

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(__base + "/public/uploads")) {
      fs.mkdirSync(__base + "/public/uploads");
    }
    cb(null, __base + "/public/uploads");
  }
});

module.exports.uploadImage = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    let ext = path.extname(file.originalname);
    if (
      ext !== ".png" &&
      ext !== ".jpg" &&
      ext !== ".gif" &&
      ext !== ".jpeg" &&
      ext !== ".PNG" &&
      ext !== ".SVG" &&
      ext !== ".JPG" &&
      ext !== ".JPEG" &&
      ext !== ".svg"
    ) {
      return callback("Only images are allowed");
    }
    callback(null, true);
  },
  // limits: {
  //   fileSize: 1024 * 1024 // Bytes
  // }
}).array("image", 5);

// limits: {
//     fileSize: 10 * 1024 * 1024,
//     fieldSize: 50 * 1024 * 1024
//   },

// file.mimetype === 'application/octet-stream'