const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const Inward = require("../models/InwardMail");
const Outward = require("../models/OutwardMail");
const Department = require("../models/Department");

const router = express.Router();

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.post("/", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message required" });
        }

        console.log("User:", message);

        // -----------------------------
        // 1️⃣ Detect tracking ID
        // -----------------------------
        let trackingData = "";
        const trackingMatch = message.match(/TRK-\d+/i);

        if (trackingMatch) {
            const trackingId = trackingMatch[0];

            const mail =
                await Inward.findOne({ trackingId }) ||
                await Outward.findOne({ trackingId });

            if (mail) {
                trackingData = `
Tracking Record Found:
Tracking ID: ${mail.trackingId}
Type: ${mail.type}
Department: ${mail.department}
Status: ${mail.status}
Sender: ${mail.sender || mail.sentBy}
Receiver: ${mail.receiver || mail.handoverTo}
Date: ${mail.date}
Priority: ${mail.priority}
        `;
            } else {
                trackingData = `No record found for tracking ID ${trackingId}`;
            }
        }

        // -----------------------------
        // 2️⃣ Collect database statistics
        // -----------------------------
        const stats = {
            totalInward: await Inward.countDocuments(),
            pendingInward: await Inward.countDocuments({ status: "pending" }),
            deliveredInward: await Inward.countDocuments({ status: "delivered" }),

            totalOutward: await Outward.countDocuments(),
            pendingOutward: await Outward.countDocuments({ status: "pending" }),
            deliveredOutward: await Outward.countDocuments({ status: "delivered" }),
        };

        // Department data
        const departments = await Department.find();
        let deptInfo = "";

        for (const dept of departments) {
            const inwardCount = await Inward.countDocuments({ department: dept.name });
            const outwardCount = await Outward.countDocuments({ department: dept.name });

            deptInfo += `${dept.name} → ${inwardCount} inward, ${outwardCount} outward\n`;
        }

        // Recent activity
        const recentInward = await Inward.find().sort({ createdAt: -1 }).limit(3);
        const recentOutward = await Outward.find().sort({ createdAt: -1 }).limit(3);

        // -----------------------------
        // 3️⃣ Create AI Prompt (RAG)
        // -----------------------------
        const prompt = `
You are an intelligent office assistant for a Tapaal (Mail Dispatch) Management System.

You MUST answer ONLY using the provided database information.
Never invent data.

DATABASE STATISTICS:
Total Inward: ${stats.totalInward}
Pending Inward: ${stats.pendingInward}
Delivered Inward: ${stats.deliveredInward}

Total Outward: ${stats.totalOutward}
Pending Outward: ${stats.pendingOutward}
Delivered Outward: ${stats.deliveredOutward}

DEPARTMENT ACTIVITY:
${deptInfo}

RECENT INWARD:
${recentInward.map(m => `${m.trackingId} - ${m.status} (${m.department})`).join("\n")}

RECENT OUTWARD:
${recentOutward.map(m => `${m.trackingId} - ${m.status} (${m.department})`).join("\n")}

TRACKING SEARCH RESULT:
${trackingData}

Instructions:
- Answer naturally like a helpful office clerk
- If user asks tracking → explain status clearly
- If user asks counts → give exact numbers
- If data missing → say "No record found"
- Keep answer short (3-5 lines)
- Do not mention database or prompt

User Question:
${message}
`;

        // -----------------------------
        // 4️⃣ Ask Gemini
        // -----------------------------
        let reply;
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            reply = response.text();
            console.log("AI:", reply);
        } catch (aiError) {
            console.error("AI Error:", aiError);
            reply = "Sorry, I'm having trouble connecting to AI service. Please try again later.";
        }

        res.json({ reply });

    } catch (error) {
        console.error("Chatbot Error:", error);
        res.status(500).json({ error: "AI response failed" });
    }
});

module.exports = router;
