// Parses a raw bank SMS string into structured transaction data
// Handles multiple SMS formats: UPI, NEFT, IMPS, ATM, salary, etc.

export function parseSms(message) {
    const amountMatch = message.match(/Rs\.?\s?([\d,]+(?:\.\d{1,2})?)/i);
    const typeMatch = message.match(/(debited|credited|withdrawn|deposited|received|sent)/i);
    const refMatch = message.match(/Ref\s*(?:No\.?)?\s*(\w+)/i);

    // Try multiple patterns to extract the other party (merchant / bank / person)
    let otherParty = null;

    // Pattern 1: "to <Name>" (UPI, transfers)
    const toMatch = message.match(/to\s+([A-Za-z\s]+?)(?:\s+on\b|\s+via\b|\s+Ref\b|\.|\s*$)/i);
    // Pattern 2: "from <Name>" (salary, NEFT credit)
    const fromMatch = message.match(/from\s+([A-Za-z\s]+?)(?:\s+on\b|\s+via\b|\s+Ref\b|\.|\s*$)/i);
    // Pattern 3: "by <Name>" (transfer by someone)
    const byMatch = message.match(/by\s+([A-Za-z\s]+?)(?:\s+on\b|\s+via\b|\s+Ref\b|\.|\s*$)/i);
    // Pattern 4: "at <Name>" (POS / ATM)
    const atMatch = message.match(/at\s+([A-Za-z\s]+?)(?:\s+on\b|\s+via\b|\s+Ref\b|\.|\s*$)/i);

    // Decide which party to use based on transaction type
    const rawType = typeMatch ? typeMatch[1].toLowerCase() : null;

    if (rawType === "credited" || rawType === "received" || rawType === "deposited") {
        // Money coming in — source is "from"
        otherParty = fromMatch ? fromMatch[1].trim() : (byMatch ? byMatch[1].trim() : null);
    } else {
        // Money going out — destination is "to" or "at"
        otherParty = toMatch ? toMatch[1].trim() : (atMatch ? atMatch[1].trim() : null);
    }

    // Normalize type to just "credited" or "debited"
    let normalizedType = null;
    if (rawType === "credited" || rawType === "received" || rawType === "deposited") {
        normalizedType = "credited";
    } else if (rawType === "debited" || rawType === "withdrawn" || rawType === "sent") {
        normalizedType = "debited";
    }

    // Detect transaction channel
    const channelMatch = message.match(/via\s+(UPI|NEFT|IMPS|RTGS|ATM|POS|NetBanking)/i);
    const channel = channelMatch ? channelMatch[1].toUpperCase() : null;

    return {
        amount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : null,
        type: normalizedType,
        merchant: otherParty,   // merchant, person, or bank name
        ref_no: refMatch ? refMatch[1] : null,
        channel: channel,       // UPI, NEFT, IMPS, ATM, etc.
        raw_message: message,
        created_at: new Date(),
    };
}
