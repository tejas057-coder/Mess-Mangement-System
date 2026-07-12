const mysql = require("mysql2");
require("dotenv").config();

const useRailway = process.env.USE_RAILWAY_DB === "true";

const db = mysql.createConnection({
    host: useRailway ? process.env.RAILWAY_DB_HOST : process.env.LOCAL_DB_HOST,
    port: useRailway ? process.env.RAILWAY_DB_PORT : process.env.LOCAL_DB_PORT,
    user: useRailway ? process.env.RAILWAY_DB_USER : process.env.LOCAL_DB_USER,
    password: useRailway ? process.env.RAILWAY_DB_PASSWORD : process.env.LOCAL_DB_PASSWORD,
    database: useRailway ? process.env.RAILWAY_DB_NAME : process.env.LOCAL_DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error("❌ MySQL connection failed:", err.message);
        return;
    }
    console.log("✅ MySQL Connected");
});





// railways testing bd code 

// db.connect((err) => {
//     if (err) {
//         console.error("❌ MySQL connection failed:", err.message);
//         return;
//     }

//     console.log("✅ Connected to Railway MySQL");

//     db.query("SELECT DATABASE() AS db", (err, result) => {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log(result);
//         }
//     });
// });

module.exports = db;