const mysql = require("mysql2");
require("dotenv").config();

let db;

// Railway (and most cloud providers) give a DATABASE_URL connection string.
// Fall back to individual env vars for local development.
if (process.env.DATABASE_URL) {
    db = mysql.createConnection(process.env.DATABASE_URL + "?ssl={\"rejectUnauthorized\":true}");
} else {
    db = mysql.createConnection({
        host:     process.env.DB_HOST     || "localhost",
        user:     process.env.DB_USER     || "root",
        password: process.env.DB_PASSWORD || "Tejas@1234",
        database: process.env.DB_NAME     || "college",
        port:     process.env.DB_PORT     || process.env.MYSQLPORT || 3306,
        ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });
}

db.connect((err) => {
    if (err) {
        console.error("MySQL connection failed:", err.message);
        return;
    }
    console.log("MySQL Connected");
});

module.exports = db;