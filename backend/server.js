const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// Initialize database tables
const initDB = () => {
    // 1. members table
    const createMembersTable = `
        CREATE TABLE IF NOT EXISTS members (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(50),
            starting_date DATE,
            amount_paid DECIMAL(10,2) DEFAULT 0,
            amount_remain DECIMAL(10,2) DEFAULT 0,
            due_date DATE,
            paid_on DATE,
            status VARCHAR(50) DEFAULT 'pending',
            total_amount DECIMAL(10,2) DEFAULT 0
        )
    `;
    db.query(createMembersTable, (err) => {
        if (err) console.error("Error creating members table:", err);
        else console.log("Members table verified/created");
    });

    // 2. payments table
    const createPaymentsTable = `
        CREATE TABLE IF NOT EXISTS payments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            member_id INT NOT NULL,
            member_name VARCHAR(255) NOT NULL,
            amount_paid DECIMAL(10,2) NOT NULL,
            payment_method VARCHAR(50) NOT NULL,
            transaction_id VARCHAR(255),
            paid_on DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
        )
    `;
    db.query(createPaymentsTable, (err) => {
        if (err) console.error("Error creating payments table:", err);
        else console.log("Payments table verified/created");
    });

    // 3. notifications table
    const createNotificationsTable = `
        CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            type VARCHAR(50) NOT NULL,
            read_status TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    db.query(createNotificationsTable, (err) => {
        if (err) console.error("Error creating notifications table:", err);
        else console.log("Notifications table verified/created");
    });
};

initDB();

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
            amount_paid || 0,
            amount_remain || 0,
            due_date,
            paid_on,
            status || "pending",
            total_amount || 0,
        ],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }

            // Create notification automatically
            const notifTitle = "New Member Joined";
            const notifMsg = `${name} has been registered as a new member with total amount ₹${total_amount || 0}.`;
            const sqlNotif = "INSERT INTO notifications (title, message, type) VALUES (?, ?, 'member')";
            db.query(sqlNotif, [notifTitle, notifMsg], (notifErr) => {
                if (notifErr) console.error("Error creating member notification:", notifErr);
            });

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
        due_date,
        status,
        total_amount,
    } = req.body;

    // Fetch sum of all actual recorded payments for this member
    const paymentSumSql = "SELECT SUM(amount_paid) AS total_paid FROM payments WHERE member_id = ?";
    db.query(paymentSumSql, [id], (sumErr, sumResult) => {
        if (sumErr) {
            console.log(sumErr);
            return res.status(500).json(sumErr);
        }

        const amount_paid = sumResult && sumResult[0] && sumResult[0].total_paid ? Number(sumResult[0].total_paid) : 0;
        const total = Number(total_amount || 0);
        const amount_remain = Math.max(0, total - amount_paid);
        const computedStatus = amount_remain <= 0 ? "paid" : (status || "pending");

        const sql = `
            UPDATE members
            SET
                name = ?,
                phone = ?,
                starting_date = ?,
                amount_paid = ?,
                amount_remain = ?,
                due_date = ?,
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
                computedStatus,
                total,
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

                // Create update notification
                const notifTitle = "Member Profile Updated";
                const notifMsg = `Profile details for ${name} have been updated. Dues calculated strictly based on transactions.`;
                const sqlNotif = "INSERT INTO notifications (title, message, type) VALUES (?, ?, 'member')";
                db.query(sqlNotif, [notifTitle, notifMsg]);

                res.json({
                    id: Number(id),
                    name,
                    phone,
                    starting_date,
                    amount_paid,
                    amount_remain,
                    due_date,
                    status: computedStatus,
                    total_amount: total,
                });
            }
        );
    });
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

app.delete("/members/:id", (req, res) => {
    const { id } = req.params;

    // Fetch member first to get name for notification
    const selectSql = "SELECT name FROM members WHERE id = ?";
    db.query(selectSql, [id], (err, selectRes) => {
        const memberName = selectRes && selectRes[0] ? selectRes[0].name : `ID ${id}`;
        
        const sql = "DELETE FROM members WHERE id = ?";
        db.query(sql, [id], (deleteErr, result) => {
            if (deleteErr) {
                console.log(deleteErr);
                return res.status(500).json({
                    message: "Failed to delete member",
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Member not found",
                });
            }

            // Create notification automatically
            const notifTitle = "Member Removed";
            const notifMsg = `${memberName} has been removed from the mess records.`;
            const sqlNotif = "INSERT INTO notifications (title, message, type) VALUES (?, ?, 'member')";
            db.query(sqlNotif, [notifTitle, notifMsg], (notifErr) => {
                if (notifErr) console.error("Error creating member deleted notification:", notifErr);
            });

            res.json({
                message: "Member deleted successfully",
            });
        });
    });
});

// --- Notifications Routes ---
app.get("/notifications", (req, res) => {
    const sql = "SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50";
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        res.json(result);
    });
});

app.post("/notifications", (req, res) => {
    const { title, message, type } = req.body;
    const sql = "INSERT INTO notifications (title, message, type) VALUES (?, ?, ?)";
    db.query(sql, [title, message, type || "system"], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        res.json({
            id: result.insertId,
            title,
            message,
            type: type || "system",
            read_status: 0,
            created_at: new Date()
        });
    });
});

app.put("/notifications/:id/read", (req, res) => {
    const { id } = req.params;
    const sql = "UPDATE notifications SET read_status = 1 WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        res.json({ message: "Notification marked as read" });
    });
});

app.put("/notifications/read-all", (req, res) => {
    const sql = "UPDATE notifications SET read_status = 1";
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        res.json({ message: "All notifications marked as read" });
    });
});

app.delete("/notifications", (req, res) => {
    const sql = "DELETE FROM notifications";
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        res.json({ message: "All notifications cleared" });
    });
});

// --- Payments / Transactions Routes ---
app.get("/payments", (req, res) => {
    const sql = "SELECT * FROM payments ORDER BY created_at DESC LIMIT 100";
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        res.json(result);
    });
});

app.post("/payments", (req, res) => {
    const { member_id, member_name, amount_paid, payment_method, transaction_id, paid_on } = req.body;

    // 1. Fetch current member details
    const selectMemberSql = "SELECT * FROM members WHERE id = ?";
    db.query(selectMemberSql, [member_id], (err, membersResult) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        if (membersResult.length === 0) {
            return res.status(404).json({ message: "Member not found" });
        }

        const member = membersResult[0];
        const newPaid = Number(member.amount_paid || 0) + Number(amount_paid);
        const newRemain = Math.max(0, Number(member.total_amount || 0) - newPaid);
        const newStatus = newRemain <= 0 ? "paid" : "pending";

        // 2. Update member details
        const updateMemberSql = `
            UPDATE members
            SET amount_paid = ?, amount_remain = ?, status = ?, paid_on = ?
            WHERE id = ?
        `;
        db.query(updateMemberSql, [newPaid, newRemain, newStatus, paid_on, member_id], (updateErr) => {
            if (updateErr) {
                console.log(updateErr);
                return res.status(500).json(updateErr);
            }

            // 3. Insert transaction log
            const insertPaymentSql = `
                INSERT INTO payments (member_id, member_name, amount_paid, payment_method, transaction_id, paid_on)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            db.query(insertPaymentSql, [member_id, member_name, amount_paid, payment_method, transaction_id, paid_on], (insertErr, paymentResult) => {
                if (insertErr) {
                    console.log(insertErr);
                    return res.status(500).json(insertErr);
                }

                // 4. Automatically trigger a notification
                const notificationTitle = `Payment Received`;
                const notificationMessage = `Successfully recorded ₹${amount_paid} from ${member_name} via ${payment_method}.`;
                const insertNotificationSql = "INSERT INTO notifications (title, message, type) VALUES (?, ?, 'payment')";
                
                db.query(insertNotificationSql, [notificationTitle, notificationMessage], (notifErr) => {
                    if (notifErr) console.error("Error creating payment notification:", notifErr);
                });

                res.json({
                    message: "Payment successfully recorded",
                    payment: {
                        id: paymentResult.insertId,
                        member_id,
                        member_name,
                        amount_paid,
                        payment_method,
                        transaction_id,
                        paid_on
                    },
                    member: {
                        id: member_id,
                        amount_paid: newPaid,
                        amount_remain: newRemain,
                        status: newStatus,
                        paid_on
                    }
                });
            });
        });
    });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});