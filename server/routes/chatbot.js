import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Inward from "../models/InwardMail.js";
import Outward from "../models/OutwardMail.js";
import Department from "../models/Department.js";

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    // ----------------------------
    // 1️⃣ Detect tracking ID
    // ----------------------------
    const trackingMatch = message.match(/TRK-\d+/i);

    let trackingInfo = "";

    if (trackingMatch) {
      const trackingId = trackingMatch[0];

      // search inward
      let mail =
        await Inward.findOne({ trackingId }) ||
        await Outward.findOne({ trackingId });

      if (mail) {
        trackingInfo = `
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
        trackingInfo = `No record found for tracking ID ${trackingId}`;
      }
    }

    // ----------------------------
    // 2️⃣ Fetch general database stats
    // ----------------------------
    const pendingInward = await Inward.countDocuments({ status: "pending" });
    const totalOutward = await Outward.countDocuments();

    // ----------------------------
    // 3️⃣ Create Gemini prompt
    // ----------------------------
    const prompt = `
You are an AI assistant for Tapaal Office Management System.

Real office statistics:
Pending inward mails: ${pendingInward}
Total outward mails: ${totalOutward}

${trackingInfo}

Instructions:
- If tracking info is present, explain it clearly to user.
- If not found, politely inform user.
- Always answer like an office assistant.
- Do NOT invent data.

User Question:
${message}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI tracking failed" });
  }
});

export default router;
