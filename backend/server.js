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
app.post("/members", (req, res) => {
    console.log(req.body);
    const { name, phone, fee , startingDate} = req.body;

    const sql = `
    INSERT INTO members(name, phone, fee , starting_date)
    VALUES (?,?,?,?)`;

    db.query(sql, [name, phone, fee, startingDate], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json({
            message: "Members added successfully"
        });
    })

    
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