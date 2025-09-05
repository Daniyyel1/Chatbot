// app/api/chat/route.js
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function callGeminiAPIWithRetry(fullPrompt, retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        maxOutputTokens: 5000,
      });

      const aiText =
        response?.candidates?.[0]?.content?.parts?.[0]?.text || null;

      return aiText || "No response from AI";
    } catch (error) {
      if (attempt < retries && error?.message?.includes("503")) {
        await new Promise((resolve) =>
          setTimeout(resolve, delay * Math.pow(2, attempt))
        );
      } else {
        throw error;
      }
    }
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    const userMessage = messages[messages.length - 1]?.content || "";

    const aiReply = await callGeminiAPIWithRetry(userMessage);

    return Response.json({
        reply: { role: "assistant", content: aiReply, sender: "robot" },
    })

  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to get response from Gemini" }, { status: 500 });
  }

    
}
