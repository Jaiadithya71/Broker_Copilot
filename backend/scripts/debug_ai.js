// backend/scripts/debug_ai.js
import { aiService } from "../src/services/aiService.js";
import 'dotenv/config';

// Mock renewal data based on the user's insurance case
const mockRenewal = {
    id: "R-DEBUG",
    clientName: "Rahul Sharma",
    policyNumber: "POL-241071027926",
    productLine: "Health Insurance",
    carrier: "HDFC ERGO",
    premium: 28500,
    expiryDate: "2025-01-10",
    status: "Discovery",
    primaryContactName: "Rahul Sharma",
    recentTouchpoints: 2,
    communications: {
        totalTouchpoints: 2,
        lastContactDate: "2025-12-15",
        recentEmails: [
            { subject: "Initial Query", date: "2025-12-14" }
        ],
        recentMeetings: [
            { summary: "Renewal discussion at office", date: "2025-12-15" }
        ]
    }
};

const mockScore = {
    value: 85,
    breakdown: {
        timeScore: 40,
        premiumScore: 45,
        daysToExpiry: 23
    }
};

async function debugAI() {
    console.log("🔍 [DEBUG] Starting AI generation test...");
    console.log("\n📦 INPUT DATA:");
    console.log(JSON.stringify(mockRenewal, null, 2));

    try {
        const brief = await aiService.generateBrief(mockRenewal, mockScore, "Akira");

        console.log("\n✨ AI OUTPUT (Brief):");
        console.log(JSON.stringify(brief, null, 2));

        if (brief.outreachTemplate) {
            console.log("\n📧 GENERATED EMAIL TEMPLATE:");
            console.log(brief.outreachTemplate);

            if (brief.outreachTemplate.includes("[Client Name]") || brief.outreachTemplate.includes("[Your Name]")) {
                console.log("\n⚠️ [WARNING] Placeholders found in outreachTemplate!");
            } else {
                console.log("\n✅ No placeholders found in outreachTemplate.");
            }
        }
    } catch (err) {
        console.error("\n❌ [ERROR] AI Generation failed:", err);
    }
}

debugAI();
