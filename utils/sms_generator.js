// Generates mock bank SMS messages for testing
// Produces varied formats: UPI, NEFT, IMPS, ATM, salary, POS
// Some messages are intentionally "suspicious" to trigger fraud detection

export function generateMockSms() {
    const merchants = ["Swiggy", "Amazon", "Zomato", "Flipkart", "SIP Investment", "Myntra", "BigBasket", "Spotify"];
    const people = ["Rahul Sharma", "Priya Singh", "Amit Kumar", "Neha Gupta", "Vikram Patel"];
    const employers = ["TCS", "Infosys", "Wipro", "HCL Tech", "ABC Corp"];
    const banks = ["SBI", "HDFC", "ICICI", "Axis", "Kotak"];
    const channels = ["UPI", "NEFT", "IMPS"];

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const refNo = Math.floor(Math.random() * 1000000);
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const bank = pick(banks);

    // 20% chance of generating a suspicious/fraud-like SMS
    const isSuspicious = Math.random() < 0.2;

    if (isSuspicious) {
        const suspiciousScenarios = [
            // High amount to unknown merchant via UPI at odd hour
            `Rs ${Math.floor(Math.random() * 50000) + 15000} debited from your ${bank} account via UPI to XYZ Pvt Ltd on ${dateStr}. Ref No ${refNo}`,
            // Huge transfer to unknown person
            `Rs ${Math.floor(Math.random() * 80000) + 20000} sent to Unknown Trader via NEFT on ${dateStr}. Ref No ${refNo}`,
            // Large ATM withdrawal
            `Rs ${Math.floor(Math.random() * 30000) + 10000} withdrawn at ${bank} ATM on ${dateStr}. Ref No ${refNo}`,
            // Rapid small charges (unknown merchant)
            `Rs ${Math.floor(Math.random() * 500) + 50} debited from your ${bank} account via UPI to Quick Pay Global on ${dateStr}. Ref No ${refNo}`,
        ];
        return pick(suspiciousScenarios);
    }

    // Normal SMS — pick a random format
    const format = Math.floor(Math.random() * 6);
    const amount = Math.floor(Math.random() * 5000) + 100;

    switch (format) {
        // UPI payment to merchant
        case 0:
            return `Rs ${amount} debited from your ${bank} account via UPI to ${pick(merchants)} on ${dateStr}. Ref No ${refNo}`;

        // NEFT/IMPS transfer to a person
        case 1: {
            const channel = pick(["NEFT", "IMPS"]);
            return `Rs ${amount} sent to ${pick(people)} via ${channel} on ${dateStr}. Ref No ${refNo}`;
        }

        // Salary / credit from employer
        case 2:
            return `Rs ${Math.floor(Math.random() * 50000) + 20000} credited from ${pick(employers)} via NEFT on ${dateStr}. Ref No ${refNo}`;

        // Money received from a person
        case 3:
            return `Rs ${amount} received from ${pick(people)} via UPI on ${dateStr}. Ref No ${refNo}`;

        // ATM withdrawal
        case 4:
            return `Rs ${Math.ceil(amount / 100) * 100} withdrawn at ${bank} ATM on ${dateStr}. Ref No ${refNo}`;

        // POS / in-store purchase
        case 5:
            return `Rs ${amount} debited from your ${bank} account via POS at ${pick(merchants)} on ${dateStr}. Ref No ${refNo}`;

        default:
            return `Rs ${amount} debited from your ${bank} account via UPI to ${pick(merchants)} on ${dateStr}. Ref No ${refNo}`;
    }
}
