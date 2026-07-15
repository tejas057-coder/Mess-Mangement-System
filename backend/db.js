const mysql = require("mysql2");
require("dotenv").config();

let db;

const connectionString = process.env.MYSQL_PUBLIC_URL || process.env.DATABASE_URL || null;

if (connectionString) {
    // Parse the MySQL connection URL: mysql://user:pass@host:port/dbname
    try {
        const url = new URL(connectionString);
        db = mysql.createConnection({
            host:     url.hostname,
            port:     Number(url.port) || 3306,
            user:     url.username,
            password: url.password,
            database: url.pathname.replace(/^\//, ""),
            ssl:      { rejectUnauthorized: false },  // required for Railway public URLs
        });
        console.log(`🔗 Connecting via URL to ${url.hostname}:${url.port}`);
    } catch (e) {
        console.error("❌ Failed to parse DB connection URL:", e.message);
        process.exit(1);
    }
} else if (process.env.USE_RAILWAY_DB === "true" && process.env.RAILWAY_DB_HOST) {
    // Railway individual vars
    db = mysql.createConnection({
        host:     process.env.RAILWAY_DB_HOST,
        port:     Number(process.env.RAILWAY_DB_PORT) || 3306,
        user:     process.env.RAILWAY_DB_USER,
        password: process.env.RAILWAY_DB_PASSWORD,
        database: process.env.RAILWAY_DB_NAME,
        ssl:      { rejectUnauthorized: false },
    });
    console.log(`🔗 Connecting to Railway DB at ${process.env.RAILWAY_DB_HOST}`);
} else {
    // Local development fallback
    db = mysql.createConnection({
        host:     process.env.LOCAL_DB_HOST     || process.env.DB_HOST     || "localhost",
        port:     Number(process.env.LOCAL_DB_PORT || process.env.DB_PORT || 3306),
        user:     process.env.LOCAL_DB_USER     || process.env.DB_USER     || "root",
        password: process.env.LOCAL_DB_PASSWORD || process.env.DB_PASSWORD || "",
        database: process.env.LOCAL_DB_NAME     || process.env.DB_NAME     || "college",
    });
    console.log("🔗 Connecting to local MySQL...");
}

db.connect((err) => {
    if (err) {
        console.error("❌ MySQL connection failed:", err.message);
        // Don't crash the server — endpoints will return 500 if DB is down
        return;
    }
    console.log("✅ MySQL Connected successfully");
});

module.exports = db;