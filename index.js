import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config(); // 读取 .env 文件里的 API Key

const app = express();
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post("/webhook", async (req, res) => {
  try {
    const userMessage = req.body.text || "Hello";
    const langPrompt = `You are ECube Trading’s customer service AI. ONLY answer questions about ECube’s products, services, store details and policies. Detect user language (Chinese, English, Malay) and reply in the same language. If question is unrelated, politely say you only answer ECube-related queries and provide contact options. Question: ${userMessage}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: langPrompt }],
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't process that.";

    res.json({ text: reply }); // 返回给 Manychat
  } catch (error) {
    console.error(error);
    res.status(500).json({ text: "Error processing request" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
