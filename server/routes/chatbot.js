const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const Inward = require("../models/InwardMail");
const Outward = require("../models/OutwardMail");
const Department = require("../models/Department");

const router = express.Router();

// Lazy Gemini setup - only initialize when needed
let ai = null;
const getGeminiAI = () => {
    if (!ai) {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY not configured");
        }
        ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });
    }
    return ai;
};

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
            const safeDeptName = dept.name.replace(/"/g, '');
            deptInfo += `${safeDeptName} → ${inwardCount} inward, ${outwardCount} outward\n`;
        }

        // Recent activity
        const recentInward = await Inward.find().sort({ createdAt: -1 }).limit(3);
        const recentOutward = await Outward.find().sort({ createdAt: -1 }).limit(3);

        // -----------------------------
        // 3️⃣ Create AI Prompt (RAG)
        // -----------------------------
        const promptText = `You are an intelligent office assistant for a Tapaal (Mail Dispatch) Management System.

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
${recentInward.map(m => `${m.trackingId} - ${m.status} (${m.department})`).join('\n')}

RECENT OUTWARD:
${recentOutward.map(m => `${m.trackingId} - ${m.status} (${m.department})`).join('\n')}

TRACKING SEARCH RESULT:
${trackingData}

Instructions:
- Answer naturally like a helpful office clerk
- If user asks tracking → explain status clearly
- If user asks counts → give exact numbers
- If data missing → say "No record found"
- Keep answer short (3-5 lines)
- Do not mention database or prompt

User Question: ${message}`;

        console.log("DEBUG: Prompt length:", promptText.length);
        console.log("DEBUG: Dept info:", JSON.stringify(deptInfo));
        console.log("DEBUG: Tracking data:", JSON.stringify(trackingData));

        // -----------------------------
        // 4️⃣ Ask Gemini (Correct API Structure)
        // -----------------------------
        let reply;
        try {
            const geminiAI = getGeminiAI();
            const response = await geminiAI.models.generateContent({
                model: "gemini-2.0-flash",
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: promptText }
                        ]
                    }
                ]
            });

            reply = response.candidates[0].content.parts[0].text;
            console.log("AI:", reply);

        } catch (error) {
            console.error("Gemini error FULL:", error);
            return res.json({
                reply: "AI service connected but model request failed. Check server logs."
            });
        }

        res.json({ reply });

    } catch (error) {
        console.error("Chatbot Error:", error);
        res.status(500).json({ error: "AI response failed" });
    }
});

module.exports = router;
