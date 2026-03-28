import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import axios from "axios";
import {normalizeAIData} from "../lib/normalizeAIResponse.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function extractJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? match[0] : null;
  } catch (err) {
    return null;
  }
}

async function imageToBase64(url) {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });
  return Buffer.from(response.data).toString("base64");
}

export const analyzeClothImage = async (imageUrl) => {
  try {
    const base64Image = await imageToBase64(imageUrl);
    const prompt = `
Analyze this clothing item and return ONLY valid JSON.

STRICT RULES:
- No explanation
- No extra text
- No markdown
- Only raw JSON

Schema:
{
  "category": "top | bottom | footwear | outerwear | accessory",
  "subCategory": "string",
  "color": {
    "primary": "string",
    "secondary": ["string"]
  },
  "style": ["casual", "formal", "streetwear", "minimal", "sporty", "ethnic"],
  "fabric": "string",
  "fit": "slim | regular | loose | oversized",
  "pattern": "solid | striped | printed | checked | graphic",
  "season": ["summer", "winter", "spring", "autumn"],
  "occasions": ["casual","formal","party","office","date","gym","travel","wedding"],
  "formality": "casual | semi-formal | formal",
  "weatherSuitability": ["hot", "cold", "mild", "rain"],
  "embeddingHint": "short text description"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/png",
                data: base64Image,
              },
            },
          ],
        },
      ],
    });

    const text = response.text;
    const cleaned = extractJSON(text);

    if (!cleaned) {
      console.error("No valid JSON found");
      return normalizeAIData(null);
    }

    try {
      const parsed = JSON.parse(cleaned);
      return normalizeAIData(parsed);
    } catch (err) {
      console.error("JSON parsing failed");
      return normalizeAIData(null);
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
};

