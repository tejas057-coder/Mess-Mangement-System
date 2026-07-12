const mysql = require("mysql2");
require("dotenv").config();

// ─────────────────────────────────────────────────────────────
//  DB Connection — works for both local dev and deployed cloud
//
//  Priority (|| chain):
//  1. DATABASE_URL  — single connection string from Railway / PlanetScale / Render
//  2. Individual env vars (DB_HOST, DB_USER, etc.) — set in .env for local dev
//  3. Hard-coded localhost fallbacks — if nothing is set at all
// ─────────────────────────────────────────────────────────────

let db;

if (process.env.DATABASE_URL) {
    // Cloud / Railway: single connection string
    db = mysql.createConnection(process.env.DATABASE_URL);
} else {
    // Local dev: individual env vars with || fallbacks
    db = mysql.createConnection({
        host:     process.env.DB_HOST     || "localhost",
        user:     process.env.DB_USER     || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME     || "college",
        port:     Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
        ssl:      process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });
}

db.connect((err) => {
    if (err) {
        console.error("❌ MySQL connection failed:", err.message);
        return;
    }
    console.log("✅ MySQL Connected");
});

module.exports = db;