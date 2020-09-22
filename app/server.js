const express = require("express");
const bodyParser = require("body-parser");
const cors = require("corss");
const session = require("node-express-sessions");
const store = require("store");
const config = require("@/config/keys");
const eventListener = require("@/app/eventListener");
const compress = require('compression');
const helmet = require('helmet');
const https = require("https");
const http = require("http");
const fs = require('fs');
const path = require('path');

let sql = require('@/app/db/database')

const { handleError, ErrorHandler } = require('@/helpers/error')

// Global Config
global.config = config
// Set Base Directory
global.__base = __dirname;

// Init Express
const app = express();
app.config = config;

// Protect using http headers
app.use(helmet());
// Compress all responses
app.use(compress());

// View Engine
app.set('view engine', 'ejs');

// session
app.set("trust proxy", 1);
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true
    }
  })
);


app.use(bodyParser.json({
  limit: "500mb"
}));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: "500mb"
}));

app.use(cors());

// Static folder
app.use(express.static(__dirname + "/public", {
  maxage: "7d"
}));

// Add API endpoint handlers
require('@/routes')(app);

app.get("/", function (req, res) {
  throw new ErrorHandler(404)
});

app.get("*", function (req, res) {
  res.status(404).json({
    message: "Sorry, there was a error"
  });
});
app.use((err, req, res, next) => {
  handleError(err, res);
});

/**
 * Event listener for HTTP server "listening" event.
 */

const onListening = function () {
  let addr = server.address();
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Server Listening on My custom port ' + bind);
};

let server = http.createServer(app);

app.set("port", process.env.PORT || config.port || 4200);
server.listen(app.get("port"));
server.on('error', eventListener.onError);
server.on('listening', onListening);

export default server;
