const mysql = require('mysql');
const configObj = require('../config/keys');

const mc = mysql.createPool(
	configObj.database
);

// open the MySQL connection
// mc.connect(error => {
mc.getConnection(error => {
	if (error) throw error;
	console.log(`Successfully connected to the database ${configObj.database.database}.`);
});

module.exports = mc;
