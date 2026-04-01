import { Request, Response } from "express";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GEMINI_API_KEY});

const SEO_PROMPT = (url: string) => `You are an SEO expert. Analyze "${url}" and return ONLY valid JSON (no markdown, no explanation) with this exact shape:
{"keywords":[{"word":"string","volume":5000,"difficulty":45,"intent":"informational","priority":"high"}],"contentGaps":[{"topic":"string","reason":"string","urgency":"critical","icon":"📝"}],"competitors":[{"name":"string","domain":"string","score":75,"sharedKeywords":80,"strengths":["string","string"]}]}
Return 6 keywords, 5 contentGaps, 4 competitors. Make it relevant to the domain niche. Return ONLY the JSON, nothing else.`;

export const analyzeSEO = async (req: Request, res: Response): Promise<void> => {
  const { url } = req.body;
  if (!url) { res.status(400).json({ error: "URL is required" }); return; }
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      messages: [{ role: "user", content: SEO_PROMPT(url) }]
    });
    const raw = completion.choices[0].message.content?.replace(/```json|```/g, "").trim() || "";
    res.json(JSON.parse(raw));
  } catch (error) {
    console.error("SEO analyze error:", error);
    res.status(500).json({ error: "Failed to analyze SEO data" });
  }
};

export const analyzeCompetitor = async (req: Request, res: Response): Promise<void> => {
  const { domain } = req.body;
  if (!domain) { res.status(400).json({ error: "Domain is required" }); return; }
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 512,
      messages: [{ role: "user", content: `Return ONLY valid JSON (no markdown) for competitor "${domain}":
{"name":"string","domain":"${domain}","score":75,"sharedKeywords":50,"strengths":["string","string"]}
score:40-95, sharedKeywords:10-200, strengths:2-3 short phrases. Infer company name from domain. Return ONLY JSON.` }]
    });
    const raw = completion.choices[0].message.content?.replace(/```json|```/g, "").trim() || "";
    res.json(JSON.parse(raw));
  } catch (error) {
    console.error("SEO competitor error:", error);
    res.status(500).json({ error: "Failed to analyze competitor" });
  }
};
