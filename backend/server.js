const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());


app.get("/members", (req, res) => {
    db.query("SELECT * FROM members", (err, result) => {
        if(err){
            return res.json(err);
        }
        res.json(result);
    });
});



app.get("/members/count", (req, res) => {
    const sql = "SELECT COUNT(*) AS totalMembers FROM members";

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.json(result[0]);
    });
});



app.listen(5000, () => {
    console.log("Server running on port 5000");
});