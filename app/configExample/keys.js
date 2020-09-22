let devDatabase = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  port: 3306,
  database: 'db_name',
  multipleStatements: true,
};
let prodDatabase = {
  host: '',
  user: '',
  password: '',
  database: '',
  port: 3306,
  multipleStatements: true,
};

let appVersion = '/v1';
let environment = 'production';
let mailDetails = {
  secure: true,
  host: 'smtp.gmail.com',
  port: 465,
  transportMethod: 'SMTP',
  auth: {
    user: 'youremail',
    pass: 'youremailpassword'
  }
}

//Set the host
let host_name = (environment == "production") ? "https://your-domain" : "http://localhost:4004";

//Set the frontend host
let frontend_host_name = (environment == "production") ? "https://your-frontend-domain" : "http://localhost:3000";

module.exports = {
  organizationName: "Cake Shop",
  database: environment == 'production' ? prodDatabase : devDatabase,
  environment,
  appVersion: environment == 'production' ? appVersion : appVersion,
  mailDetails,
  port: '5500',
  hasHttps: false,
  host_name,
  frontend_host_name,
  jwtSecret: "LOL",
  cryptoSecretKey: "LOL",
  uploadType: "local", // aws
  uploadCredential: {
    uploadPath: "",
    uploadURL: "",
    awsConfig: {
      ACL: 'public-read',
      region: 'region',
      signatureVersion: 'version',
      bucketName: 'bucket',
      accessKeyId: 'XXXXXXXXXXXX',
      secretAccessKey: 'XXXXXXXXX'
    }
  },
};