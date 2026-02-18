// Maps merchant names to your existing CategoryType enum values
// Enum: "FOOD & GROCERY", "HEALTHCARE", "EDUCATION", "RENTS & BILLS",
//       "TRAVEL", "ENTERTAINMENT", "LOAN-EMI", "OTHERS"

export function categorizeTransaction(merchant) {
    if (!merchant) return "OTHERS";

    const name = merchant.toLowerCase();

    // Food & Grocery
    if (name.includes("swiggy") || name.includes("zomato") || name.includes("bigbasket"))
        return "FOOD & GROCERY";

    // Shopping → mapped to OTHERS (or add SHOPPING to enum if you want)
    if (name.includes("amazon") || name.includes("flipkart") || name.includes("myntra"))
        return "OTHERS";

    // Investment / SIP → mapped to OTHERS
    if (name.includes("sip") || name.includes("investment"))
        return "OTHERS";

    // Travel
    if (name.includes("uber") || name.includes("ola") || name.includes("irctc"))
        return "TRAVEL";

    // Entertainment
    if (name.includes("netflix") || name.includes("hotstar") || name.includes("spotify"))
        return "ENTERTAINMENT";

    return "OTHERS";
}
