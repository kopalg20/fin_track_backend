import { supabase } from '../supabaseClient.js';

// Known/trusted merchants
const TRUSTED_MERCHANTS = [
    "swiggy", "amazon", "zomato", "flipkart", "myntra",
    "bigbasket", "sip investment", "uber", "ola", "irctc",
    "netflix", "hotstar", "spotify"
];

// Thresholds
const HIGH_AMOUNT_THRESHOLD = 10000;   // Rs 10,000+
const RAPID_TXN_COUNT = 3;            // 3+ transactions
const RAPID_TXN_WINDOW_MINS = 5;      // within 5 minutes

/**
 * Runs fraud detection rules on a parsed SMS transaction.
 * Returns { is_fraud, risk_score (0-100), flags[] }
 */
export async function detectFraud(parsed, userId) {
    const flags = [];
    let riskScore = 0;

    // Rule 1: High amount
    if (parsed.amount && parsed.amount >= HIGH_AMOUNT_THRESHOLD) {
        flags.push("HIGH_AMOUNT");
        riskScore += 30;
    }

    // Rule 2: Unknown merchant
    if (parsed.merchant) {
        const merchantLower = parsed.merchant.toLowerCase();
        const isTrusted = TRUSTED_MERCHANTS.some(m => merchantLower.includes(m));
        if (!isTrusted) {
            flags.push("UNKNOWN_MERCHANT");
            riskScore += 25;
        }
    }

    // Rule 3: Unusual hour (1 AM - 5 AM)
    const hour = new Date().getHours();
    if (hour >= 1 && hour <= 5) {
        flags.push("UNUSUAL_HOUR");
        riskScore += 20;
    }

    // Rule 4: Rapid frequency — multiple transactions in short window
    if (userId) {
        try {
            const windowStart = new Date(Date.now() - RAPID_TXN_WINDOW_MINS * 60 * 1000).toISOString();
            const { data, error } = await supabase
                .from("sms_logs")
                .select("id")
                .eq("user_id", userId)
                .gte("created_at", windowStart);

            if (!error && data && data.length >= RAPID_TXN_COUNT) {
                flags.push("RAPID_FREQUENCY");
                riskScore += 25;
            }
        } catch (err) {
            console.error("Fraud check - rapid frequency error:", err.message);
        }
    }

    // Cap score at 100
    riskScore = Math.min(riskScore, 100);

    return {
        is_fraud: riskScore >= 50,
        risk_score: riskScore,
        flags,
    };
}
