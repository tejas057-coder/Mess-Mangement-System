// ─────────────────────────────────────────────────────────────────
//  SMS Service — Fast2SMS (Indian SMS gateway)
//  Sign up free at: https://www.fast2sms.com
//  Set SMS_API_KEY in your .env to enable SMS alerts
// ─────────────────────────────────────────────────────────────────

const https = require("https");

/**
 * Send an SMS via Fast2SMS API.
 * @param {string} phone  - 10-digit Indian mobile number (without +91)
 * @param {string} message - SMS text (max 160 chars for 1 SMS unit)
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
function sendSMS(phone, message) {
    return new Promise((resolve) => {
        const apiKey = process.env.SMS_API_KEY || "";

        // If no API key is configured, skip silently
        if (!apiKey || apiKey === "YOUR_FAST2SMS_API_KEY") {
            console.log(`[SMS] Skipped (no API key): ${phone} → ${message}`);
            return resolve({ success: false, error: "SMS_API_KEY not configured" });
        }

        // Normalize phone: strip +91, spaces, dashes → keep 10 digits
        const normalized = String(phone).replace(/[\s\-+]/g, "").replace(/^91/, "").slice(-10);

        if (normalized.length !== 10 || !/^\d+$/.test(normalized)) {
            console.warn(`[SMS] Invalid phone number: ${phone}`);
            return resolve({ success: false, error: "Invalid phone number" });
        }

        const postData = JSON.stringify({
            route:   "q",           // "q" = Quick Transactional (no template approval needed)
            message: message.slice(0, 160),
            numbers: normalized,
            flash:   0,
        });

        const options = {
            hostname: "www.fast2sms.com",
            path:     "/dev/bulkV2",
            method:   "POST",
            headers: {
                "authorization": apiKey,
                "Content-Type":  "application/json",
                "Content-Length": Buffer.byteLength(postData),
            },
        };

        const req = https.request(options, (res2) => {
            let body = "";
            res2.on("data", (chunk) => { body += chunk; });
            res2.on("end", () => {
                try {
                    const data = JSON.parse(body);
                    if (data.return === true) {
                        console.log(`[SMS] ✅ Sent to ${normalized}: ${message.slice(0, 40)}...`);
                        resolve({ success: true, data });
                    } else {
                        console.warn(`[SMS] ⚠️ Failed: ${JSON.stringify(data)}`);
                        resolve({ success: false, error: data.message || "Unknown error" });
                    }
                } catch (e) {
                    resolve({ success: false, error: "Invalid JSON response from Fast2SMS" });
                }
            });
        });

        req.on("error", (err) => {
            console.error("[SMS] Request error:", err.message);
            resolve({ success: false, error: err.message });
        });

        req.write(postData);
        req.end();
    });
}

/**
 * Send an SMS to multiple numbers.
 * @param {string[]} phones  - Array of phone numbers
 * @param {string}   message - SMS text
 */
async function sendSMSToMany(phones, message) {
    const results = await Promise.all(
        phones.filter(Boolean).map((p) => sendSMS(p, message))
    );
    return results;
}

module.exports = { sendSMS, sendSMSToMany };
