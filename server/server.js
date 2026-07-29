import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is missing. Add it to your .env file.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.7,
  },
});

const cleanJsonResponse = (text) => {
  const cleaned = String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("AI response did not contain JSON.");
  }

  return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
};

const normalizeStop = (stop, dayIndex, stopIndex) => ({
  id: String(stop?.id || `day${dayIndex + 1}-stop${stopIndex + 1}-${Date.now()}`),
  time: String(stop?.time || "09:00 AM"),
  name: String(stop?.name || "Local experience"),
  category: String(stop?.category || "Experience"),
  area: String(stop?.area || "Local area"),
  description: String(stop?.description || "Explore this destination."),
  duration: String(stop?.duration || "1–2 hours"),
  estimatedCost: String(stop?.estimatedCost || "Varies"),
  details: String(stop?.details || "Check local timings before visiting."),
});

const normalizeTrip = (trip) => {
  if (!trip || !Array.isArray(trip.days) || trip.days.length === 0) {
    throw new Error("Incomplete itinerary returned by AI.");
  }

  return {
    title: String(trip.title || "Your Voyage"),
    destination: String(trip.destination || "Your destination"),
    summary: String(trip.summary || "A personalized journey built around you."),
    estimatedBudget: String(trip.estimatedBudget || "Varies"),
    days: trip.days.map((day, dayIndex) => ({
      day: Number(day?.day || dayIndex + 1),
      title: String(day?.title || `Day ${dayIndex + 1}`),
      stops: Array.isArray(day?.stops)
        ? day.stops.map((stop, stopIndex) =>
            normalizeStop(stop, dayIndex, stopIndex)
          )
        : [],
    })),
  };
};

const statusFromError = (error) =>
  error?.status || error?.response?.status || error?.cause?.status || 500;

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Voyage API is running." });
});

app.post("/api/generate-trip", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        error: "Please describe the trip you want to plan.",
      });
    }

    if (prompt.length > 2000) {
      return res.status(400).json({
        error: "Please keep your trip description under 2000 characters.",
      });
    }

    const systemPrompt = `
You are Voyage, an expert AI travel planner.

Create a realistic, polished, practical day-by-day itinerary from the user's request.

IMPORTANT:
- Return ONLY valid JSON.
- No markdown or code fences.
- Follow the requested number of days.
- Include 3 to 5 useful stops per day when appropriate.
- Keep nearby activities together.
- Account for realistic travel time.
- Respect the user's approximate budget.
- Use realistic estimated costs.
- If the user requests Indian currency, use ₹.
- Do not invent exact opening hours unless reasonably certain.
- Each stop must represent one distinct place or activity.
- Keep descriptions concise and useful.

Return EXACTLY this structure:
{
  "title": "Creative trip title",
  "destination": "Main destination",
  "summary": "One or two sentence overview",
  "estimatedBudget": "Estimated total cost per person",
  "days": [
    {
      "day": 1,
      "title": "Theme for the day",
      "stops": [
        {
          "id": "day1-stop1",
          "time": "09:00 AM",
          "name": "Place or activity",
          "category": "Food / Culture / Nature / Shopping / Landmark / Adventure / Relaxation / Entertainment",
          "area": "Neighbourhood or area",
          "description": "Short description",
          "duration": "1.5 hours",
          "estimatedCost": "₹500",
          "details": "A practical local tip"
        }
      ]
    }
  ]
}

USER REQUEST:
${prompt.trim()}
`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const trip = normalizeTrip(cleanJsonResponse(response.text()));

    res.json(trip);
  } catch (error) {
    console.error("Generate trip error:", error);
    const status = statusFromError(error);

    if (status === 429) {
      return res.status(429).json({
        error: "The AI service is busy. Please wait a moment and try again.",
      });
    }

    if (status === 503) {
      return res.status(503).json({
        error: "The AI service is temporarily unavailable. Please try again shortly.",
      });
    }

    if (status === 401 || status === 403) {
      return res.status(500).json({
        error: "There is a problem with the Gemini API configuration.",
      });
    }

    res.status(500).json({
      error: "We couldn't create your journey. Please try again.",
    });
  }
});

app.post("/api/regenerate-stop", async (req, res) => {
  try {
    const { stop, destination, dayTitle } = req.body;

    if (!stop) {
      return res.status(400).json({ error: "Stop information is required." });
    }

    const prompt = `
You are an expert travel planner.

Replace ONE activity in an existing itinerary.

Destination: ${destination || "Unknown"}
Day theme: ${dayTitle || "General sightseeing"}

CURRENT ACTIVITY:
Name: ${stop.name || ""}
Time: ${stop.time || ""}
Category: ${stop.category || ""}
Area: ${stop.area || ""}
Duration: ${stop.duration || ""}
Estimated cost: ${stop.estimatedCost || ""}

RULES:
- Suggest a genuinely different place or activity.
- Keep the exact same scheduled time.
- Keep approximately the same duration.
- Keep it geographically reasonable.
- Do not suggest "${stop.name}" again.
- Return ONLY valid JSON.
- No markdown.

Return:
{
  "time": "${stop.time || "09:00 AM"}",
  "name": "Replacement activity",
  "category": "Category",
  "area": "Area",
  "description": "Short useful description",
  "duration": "Duration",
  "estimatedCost": "Estimated cost",
  "details": "Useful local tip"
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const replacement = cleanJsonResponse(response.text());

    res.json({
      ...replacement,
      id: stop.id,
      time: stop.time,
    });
  } catch (error) {
    console.error("Regenerate stop error:", error);
    const status = statusFromError(error);

    if (status === 429 || status === 503) {
      return res.status(status).json({
        error: "The AI service is busy right now. Please try again shortly.",
      });
    }

    res.status(500).json({
      error: "Couldn't replace this activity. Please try again.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`✦ Voyage API running on http://localhost:${PORT}`);
});
