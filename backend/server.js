const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/members", (req, res) => {
    const sql = `
        SELECT *
        FROM members
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        res.json(result);
    });
});

app.post("/members", (req, res) => {
    const {
        name,
        phone,
        starting_date,
        amount_paid,
        amount_remain,
        due_date,
        paid_on,
        status,
        total_amount,
    } = req.body;

    const sql = `
        INSERT INTO members
        (
            name,
            phone,
            starting_date,
            amount_paid,
            amount_remain,
            due_date,
            paid_on,
            status,
            total_amount
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            name,
            phone,
            starting_date,
            amount_paid,
            amount_remain,
            due_date,
            paid_on,
            status || "pending",
            total_amount,
        ],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }

            res.json({
                id: result.insertId,
                name,
                phone,
                starting_date,
                amount_paid,
                amount_remain,
                due_date,
                paid_on,
                status: status || "pending",
                total_amount,
            });
        }
    );
});

app.put("/members/:id", (req, res) => {
    const { id } = req.params;
    const {
        name,
        phone,
        starting_date,
        amount_paid,
        amount_remain,
        due_date,
        paid_on,
        status,
        total_amount,
    } = req.body;

    const sql = `
    UPDATE members
    SET
      name = ?,
      phone = ?,
      starting_date = ?,
      amount_paid = ?,
      amount_remain = ?,
      due_date = ?,
      paid_on = ?,
      status = ?,
      total_amount = ?
    WHERE id = ?
  `;

    db.query(
        sql,
        [
            name,
            phone,
            starting_date,
            amount_paid,
            amount_remain,
            due_date,
            paid_on,
            status || "pending",
            total_amount,
            id,
        ],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Member not found" });
            }

            res.json({
                id: Number(id),
                name,
                phone,
                starting_date,
                amount_paid,
                amount_remain,
                due_date,
                paid_on,
                status: status || "pending",
                total_amount,
            });
        }
    );
});

app.get("/members/count", (req, res) => {
    const sql = "SELECT COUNT(*) AS totalMembers FROM members";

    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        res.json(result[0]);
    });
});

app.put("/members/:id", (req, res) => {
    const { id } = req.params;
    const {
        name,
        phone,
        starting_date,
        amount_paid,
        amount_remain,
        due_date,
        paid_on,
        status,
        total_amount,
    } = req.body;

    const sql = `
        UPDATE members
        SET
            name = ?,
            phone = ?,
            starting_date = ?,
            amount_paid = ?,
            amount_remain = ?,
            due_date = ?,
            paid_on = ?,
            status = ?,
            total_amount = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            name,
            phone,
            starting_date,
            amount_paid,
            amount_remain,
            due_date,
            paid_on,
            status || "pending",
            total_amount,
            id,
        ],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Member not found" });
            }

            res.json({
                id: Number(id),
                name,
                phone,
                starting_date,
                amount_paid,
                amount_remain,
                due_date,
                paid_on,
                status: status || "pending",
                total_amount,
            });
        }
    );
});

app.delete("/members/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM members WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "Failed to delete member",
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Member not found",
            });
        }

        res.json({
            message: "Member deleted successfully",
        });
    });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});