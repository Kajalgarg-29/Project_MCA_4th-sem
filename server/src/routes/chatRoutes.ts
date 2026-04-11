import { Router, Request, Response } from "express";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { messages, system } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ message: "messages array is required" });
    return;
  }

  if (!process.env.GROQ_API_KEY) {
    res.status(500).json({ message: "GROQ_API_KEY is not configured" });
    return;
  }

  const cleanMessages = messages
    .filter((m: any) => m.content && m.content.trim() !== "")
    .map((m: any) => ({
      role: m.role as "user" | "assistant",
      content: m.content.trim(),
    }));

  if (cleanMessages.length === 0 || cleanMessages[0].role !== "user") {
    res.status(400).json({ message: "First message must be from user" });
    return;
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        messages: [
          { role: "system", content: system ?? "You are a helpful assistant." },
          ...cleanMessages,
        ],
      }),
    });

    const data: any = await response.json(); // ✅ explicit any fixes TS errors

    if (!response.ok) {
      console.error("Groq error:", JSON.stringify(data, null, 2));
      res.status(response.status).json({ 
        message: data?.error?.message || "Groq API error" 
      });
      return;
    }

    const assistantText: string = data?.choices?.[0]?.message?.content || "No response";
    
    res.json({
      content: [{ type: "text", text: assistantText }]
    });

  } catch (error: any) {
    console.error("Fetch error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

export default router;