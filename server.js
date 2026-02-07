require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const chatbotRoute = require("./server/routes/chatbot");

const app = express();

/* ---------------- CORS FIX ---------------- */
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://tapaal-frontend.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());

/* ---------------- MongoDB ---------------- */
mongoose.connect(process.env.MONGODB_URI)
.then(()=> console.log("MongoDB Connected"))
.catch(err => console.log(err));

/* ---------------- Routes ---------------- */
app.use("/api/chatbot", chatbotRoute);

app.get("/", (req,res)=>{
  res.send("Tapaal backend running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log("Server running on port", PORT));
