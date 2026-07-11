require("dotenv").config();
const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: process.env.MYSQLHOST,
    port: Number(process.env.MYSQLPORT),
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
});

connection.connect((err) => {
    if (err) {
        console.error(err);
    } else {
        console.log("Connected successfully!");
    }
    connection.end();
});