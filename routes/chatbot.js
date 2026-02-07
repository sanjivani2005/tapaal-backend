const express = require("express");
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");

const Inward = require("../models/InwardMail");
const Outward = require("../models/OutwardMail");
const Department = require("../models/Department");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

router.post("/", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.json({ reply: "Please ask a question." });
    }

    /* ---------- FETCH REAL DATABASE DATA ---------- */

    const totalInward = await Inward.countDocuments();
    const pendingInward = await Inward.countDocuments({ status: "pending" });
    const deliveredInward = await Inward.countDocuments({ status: "delivered" });

    const totalOutward = await Outward.countDocuments();
    const pendingOutward = await Outward.countDocuments({ status: "pending" });
    const deliveredOutward = await Outward.countDocuments({ status: "delivered" });

    const departments = await Department.find().lean();

    const deptInfo = departments.map(d =>
      `${d.name} (HOD: ${d.headOfDepartment || "Not assigned"})` 
    ).join("\n");

    /* ---------- RAG PROMPT ---------- */

    const prompt = `
You are an intelligent assistant for Tapaal Office Mail Management System.

REAL DATABASE DATA:

Total Inward Mails: ${totalInward}
Pending Inward: ${pendingInward}
Delivered Inward: ${deliveredInward}

Total Outward Mails: ${totalOutward}
Pending Outward: ${pendingOutward}
Delivered Outward: ${deliveredOutward}

Departments:
${deptInfo}

Rules:
- Answer using the database data above.
- If user asks statistics → give numbers.
- If user asks about departments → use department list.
- If greeting → greet politely.
- Keep answers short and clear (2-4 lines max).
- Hindi question → Hindi answer.
- English question → English answer.

User Question:
${userMessage}
`;

    /* ---------- GEMINI CALL ---------- */

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    });

    const reply =
      response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "AI could not generate response.";

    res.json({ reply });

  } catch (error) {
    console.error("AI ERROR:", error);
    res.json({
      reply: "AI service temporarily unavailable. Please try again."
    });
  }
});

module.exports = router;
