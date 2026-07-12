require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const db = require("./db");
const { sendSMS } = require("./smsService");

// ── SMS helper: reads phone + feature flags from env ──────────
function smsEnabled(flag) {
    return process.env.SMS_API_KEY &&
           process.env.SMS_API_KEY !== "YOUR_FAST2SMS_API_KEY" &&
           process.env[flag] !== "false";
}
function ownerPhone() {
    return process.env.SMS_OWNER_PHONE || "";
}

const app = express();

// Razorpay instance — uses your keys from .env file
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_REPLACE_WITH_YOUR_KEY_ID",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "REPLACE_WITH_YOUR_KEY_SECRET",
});

// Raw body parser needed ONLY for webhook signature verification
app.use("/webhook/razorpay", express.raw({ type: "application/json" }));

// ─────────────────────────────────────────────────────────────
//  CORS — allows localhost dev + all deployed Vercel frontends
// ─────────────────────────────────────────────────────────────
const allowedOrigins = [
    // Local dev
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000",
    // Deployed Vercel frontend (all known URLs)
    "https://mess-mangement-system-bg44.vercel.app",
    "https://mess-mangement-system.vercel.app",
    // Env-var override: set FRONTEND_URL in Render/Railway dashboard
    process.env.FRONTEND_URL || "",
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); // Postman, server-to-server
        if (allowedOrigins.includes(origin)) return callback(null, true);
        if (origin.endsWith(".vercel.app")) return callback(null, true); // any Vercel preview
        if (origin.endsWith(".onrender.com")) return callback(null, true); // Render previews
        console.warn("CORS blocked:", origin);
        callback(new Error("CORS: origin not allowed — " + origin));
    },
    credentials: true,
}));
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
        if (err) {
            console.error("Error creating notifications table:", err);
            return;
        }
        console.log("Notifications table verified/created");

        // Sync and correct any corrupted or inconsistent member financials on startup
        const syncFinancialsQuery = `
            UPDATE members m
            LEFT JOIN (
                SELECT member_id, SUM(amount_paid) AS total_paid
                FROM payments
                GROUP BY member_id
            ) p ON m.id = p.member_id
            SET 
                m.amount_paid = COALESCE(p.total_paid, 0),
                m.amount_remain = GREATEST(0, m.total_amount - COALESCE(p.total_paid, 0)),
                m.status = CASE 
                    WHEN GREATEST(0, m.total_amount - COALESCE(p.total_paid, 0)) <= 0 THEN 'paid'
                    ELSE 'pending'
                END
        `;
        db.query(syncFinancialsQuery, (syncErr) => {
            if (syncErr) console.error("Error syncing members financial integrity on startup:", syncErr);
            else console.log("Database financial consistency synced and verified successfully on startup");
        });
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

    const paid = Number(amount_paid || 0);
    const total = Number(total_amount || 0);
    const remain = Math.max(0, total - paid);
    const computedStatus = remain <= 0 ? "paid" : (status || "pending");

    db.query(
        sql,
        [
            name,
            phone,
            starting_date,
            paid,
            remain,
            due_date,
            paid_on,
            computedStatus,
            total,
        ],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }

            // Create in-app notification
            const notifTitle = "New Member Joined";
            const notifMsg = `${name} has been registered as a new member with total amount ₹${total}.`;
            const sqlNotif = "INSERT INTO notifications (title, message, type) VALUES (?, ?, 'member')";
            db.query(sqlNotif, [notifTitle, notifMsg], (notifErr) => {
                if (notifErr) console.error("Error creating member notification:", notifErr);
            });

            // Send SMS alert to owner
            if (smsEnabled("SMS_ON_MEMBER_ADD") && ownerPhone()) {
                const smsText = `MessMate: New member added! Name: ${name}, Phone: ${phone || "N/A"}, Monthly: Rs.${total}. Check your dashboard for details.`;
                sendSMS(ownerPhone(), smsText);
                // Also SMS the member if they have a phone number
                if (phone) {
                    const memberSms = `Welcome to the mess, ${name}! Your monthly fee is Rs.${total}. Joining date: ${starting_date || "today"}. - MessMate`;
                    sendSMS(phone, memberSms);
                }
            }

            res.json({
                id: result.insertId,
                name,
                phone,
                starting_date,
                amount_paid: paid,
                amount_remain: remain,
                due_date,
                paid_on,
                status: computedStatus,
                total_amount: total,
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

                // Create in-app notification
                const notifTitle = "Member Profile Updated";
                const notifMsg = `Profile details for ${name} have been updated. Dues calculated strictly based on transactions.`;
                const sqlNotif = "INSERT INTO notifications (title, message, type) VALUES (?, ?, 'member')";
                db.query(sqlNotif, [notifTitle, notifMsg]);

                // Send SMS alert to owner
                if (smsEnabled("SMS_ON_MEMBER_UPDATE") && ownerPhone()) {
                    const smsText = `MessMate: Member updated - ${name} (Phone: ${phone || "N/A"}). Total: Rs.${total}, Paid: Rs.${amount_paid}, Due: Rs.${amount_remain}. Status: ${computedStatus}.`;
                    sendSMS(ownerPhone(), smsText);
                }

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

    // A. Check for duplicate Transaction ID (UPI Reference/UTR ID) if payment is online
    if (payment_method !== "Cash" && transaction_id) {
        const dupCheckSql = "SELECT id FROM payments WHERE transaction_id = ?";
        db.query(dupCheckSql, [transaction_id], (dupErr, dupRes) => {
            if (dupErr) {
                console.log(dupErr);
                return res.status(500).json(dupErr);
            }
            if (dupRes.length > 0) {
                return res.status(400).json({ message: "Duplicate Transaction: This UPI Reference / UTR ID has already been recorded in the system." });
            }
            
            // Proceed to fetch member details and update
            processPayment();
        });
    } else {
        processPayment();
    }

    function processPayment() {
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

                    // 4. Automatically trigger in-app notification
                    const notificationTitle = `Payment Received`;
                    const notificationMessage = `Successfully recorded ₹${amount_paid} from ${member_name} via ${payment_method}.`;
                    const insertNotificationSql = "INSERT INTO notifications (title, message, type) VALUES (?, ?, 'payment')";
                    db.query(insertNotificationSql, [notificationTitle, notificationMessage], (notifErr) => {
                        if (notifErr) console.error("Error creating payment notification:", notifErr);
                    });

                    // 5. Send SMS alerts
                    if (smsEnabled("SMS_ON_PAYMENT")) {
                        // Alert owner
                        if (ownerPhone()) {
                            const ownerSms = `MessMate Payment: Rs.${amount_paid} received from ${member_name} via ${payment_method}. Ref: ${transaction_id || "Cash"}. Balance due: Rs.${newRemain}. Status: ${newStatus}.`;
                            sendSMS(ownerPhone(), ownerSms);
                        }
                        // Alert member (if their phone is stored)
                        if (member.phone) {
                            const memberSms = newRemain <= 0
                                ? `Dear ${member_name}, Rs.${amount_paid} payment received via ${payment_method}. Your mess dues are fully CLEARED! Thank you. - MessMate`
                                : `Dear ${member_name}, Rs.${amount_paid} payment received via ${payment_method}. Remaining balance: Rs.${newRemain}. Thank you! - MessMate`;
                            sendSMS(member.phone, memberSms);
                        }
                    }

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
    }
});

// ─────────────────────────────────────────────
// RAZORPAY ROUTES
// ─────────────────────────────────────────────

// Create a Razorpay order for a specific member payment
app.post("/payments/create-order", async (req, res) => {
    const { member_id, member_name, amount } = req.body;

    if (!member_id || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid member or amount" });
    }

    try {
        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100), // Razorpay uses paise (₹1 = 100 paise)
            currency: "INR",
            receipt: `mess_${member_id}_${Date.now()}`,
            notes: {
                member_id: String(member_id),
                member_name: member_name,
            },
        });

        res.json({
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_REPLACE_WITH_YOUR_KEY_ID",
        });
    } catch (err) {
        console.error("Razorpay order creation failed:", err);
        res.status(500).json({ message: "Failed to create payment order. Check your Razorpay API keys in .env file." });
    }
});

// Razorpay Webhook — auto-records payment when Razorpay confirms payment.captured
app.post("/webhook/razorpay", (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.body; // raw buffer from express.raw middleware

    // Verify webhook signature to ensure it's genuinely from Razorpay
    if (webhookSecret && signature) {
        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(rawBody)
            .digest("hex");

        if (expectedSignature !== signature) {
            console.warn("Razorpay webhook: Invalid signature — rejected");
            return res.status(401).json({ message: "Invalid signature" });
        }
    }

    let event;
    try {
        event = JSON.parse(rawBody.toString());
    } catch (e) {
        return res.status(400).json({ message: "Invalid JSON body" });
    }

    // Only process payment.captured events (money actually received)
    if (event.event !== "payment.captured") {
        return res.json({ status: "ignored" });
    }

    const payment = event.payload.payment.entity;
    const member_id = Number(payment.notes?.member_id);
    const member_name = payment.notes?.member_name || "Unknown";
    const amount_paid = payment.amount / 100; // convert paise back to ₹
    const transaction_id = payment.id; // Razorpay payment ID (e.g. pay_xxxxxx)
    const paid_on = new Date().toISOString().split("T")[0];
    const payment_method = payment.method || "UPI";

    if (!member_id) {
        console.warn("Webhook received but no member_id in notes");
        return res.json({ status: "no_member_id" });
    }

    // Check for duplicate webhook (same Razorpay payment ID)
    db.query("SELECT id FROM payments WHERE transaction_id = ?", [transaction_id], (dupErr, dupRes) => {
        if (dupErr) return res.status(500).json({ message: "DB error checking duplicate" });
        if (dupRes.length > 0) {
            console.log("Webhook duplicate payment ignored:", transaction_id);
            return res.json({ status: "duplicate_ignored" });
        }

        // Fetch member and update
        db.query("SELECT * FROM members WHERE id = ?", [member_id], (err, membersResult) => {
            if (err || membersResult.length === 0) {
                return res.status(404).json({ message: "Member not found" });
            }

            const member = membersResult[0];
            const newPaid = Number(member.amount_paid || 0) + Number(amount_paid);
            const newRemain = Math.max(0, Number(member.total_amount || 0) - newPaid);
            const newStatus = newRemain <= 0 ? "paid" : "pending";

            // Update member financials
            db.query(
                "UPDATE members SET amount_paid = ?, amount_remain = ?, status = ?, paid_on = ? WHERE id = ?",
                [newPaid, newRemain, newStatus, paid_on, member_id],
                (updateErr) => {
                    if (updateErr) return res.status(500).json(updateErr);

                    // Insert immutable payment log
                    db.query(
                        "INSERT INTO payments (member_id, member_name, amount_paid, payment_method, transaction_id, paid_on) VALUES (?, ?, ?, ?, ?, ?)",
                        [member_id, member_name, amount_paid, payment_method, transaction_id, paid_on],
                        (insertErr) => {
                            if (insertErr) return res.status(500).json(insertErr);

                            // Log notification
                            const title = "💰 Payment Auto-Confirmed via Razorpay";
                            const message = `₹${amount_paid} received from ${member_name} (Ref: ${transaction_id}). Balance updated automatically.`;
                            db.query("INSERT INTO notifications (title, message, type) VALUES (?, ?, 'payment')", [title, message]);

                            console.log(`✅ Webhook: Auto-recorded ₹${amount_paid} from ${member_name} (Razorpay: ${transaction_id})`);
                            res.json({ status: "success", member_id, amount_paid });
                        }
                    );
                }
            );
        });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// ─────────────────────────────────────────────
// SMS SETTINGS ENDPOINTS
// ─────────────────────────────────────────────

// GET current SMS settings (masks API key for security)
app.get("/sms-settings", (req, res) => {
    const apiKey = process.env.SMS_API_KEY || "";
    res.json({
        configured:       apiKey && apiKey !== "YOUR_FAST2SMS_API_KEY",
        apiKeyMasked:     apiKey ? apiKey.slice(0, 6) + "••••••••" + apiKey.slice(-4) : "",
        ownerPhone:       process.env.SMS_OWNER_PHONE || "",
        smsOnPayment:     process.env.SMS_ON_PAYMENT  !== "false",
        smsOnMemberAdd:   process.env.SMS_ON_MEMBER_ADD !== "false",
        smsOnMemberUpdate:process.env.SMS_ON_MEMBER_UPDATE !== "false",
    });
});

// POST send a test SMS to verify the API key works
app.post("/sms-settings/test", async (req, res) => {
    const { phone } = req.body;
    const testPhone = phone || process.env.SMS_OWNER_PHONE;
    if (!testPhone) return res.status(400).json({ message: "No phone number provided" });
    const result = await sendSMS(testPhone, "MessMate Test: SMS alerts are working correctly! Your mess management system is connected.");
    if (result.success) {
        res.json({ message: `✅ Test SMS sent to ${testPhone} successfully!` });
    } else {
        res.status(400).json({ message: `❌ Failed to send SMS: ${result.error}` });
    }
});