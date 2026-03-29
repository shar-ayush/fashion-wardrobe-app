import { OpenRouter } from "@openrouter/sdk";

const openrouter = new OpenRouter({
  apiKey: process.env.OPEN_ROUTER_API_KEY,
});

async function selectBestOutfit(topCombinations, userQuery, intent) {  
  // Prepare summaries for LLM
  const summaries = topCombinations.map((combo, i) => ({
    index: i,
    compatibilityScore: combo.score.total,
    scoreBreakdown: combo.score.breakdown,

    top: {
      id: combo.top._id,
      description: combo.top.embeddingHint,
      color: combo.top.color?.primary,
      formality: combo.top.formality,
    },

    bottom: {
      id: combo.bottom._id,
      description: combo.bottom.embeddingHint,
      color: combo.bottom.color?.primary,
    },

    shoes: {
      id: combo.shoe._id,
      description: combo.shoe.embeddingHint,
      color: combo.shoe.color?.primary,
    },
  }));

  const prompt = `
User wants: "${userQuery}"
Occasion: ${intent.occasions || "general"}, Formality: ${intent.formality || "any"}

Top outfit combinations from their wardrobe (pre-scored):
${JSON.stringify(summaries, null, 2)}

Pick the best one and return ONLY valid JSON:
{
  "selectedIndex": <number>,
  "outfitName": "<short catchy name like 'Effortless Date Night'>",
  "stylingTip": "<one specific actionable tip>",
  "whyItWorks": "<one sentence on color or style harmony>"
}
`;

  try {
    const response = await openrouter.chat.send({
      chatGenerationParams: {
        model: "openai/gpt-oss-20b:free", 
        messages: [
          {
            role: "system",
            content:
              "You are a strict JSON generator. Only output raw JSON. No explanation. No markdown.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],

        temperature: 0.2,
      },
    });

    const content = response.choices?.[0]?.message?.content;
    const result = JSON.parse(content);

    const selected =
      topCombinations[result.selectedIndex] || topCombinations[0];

    return {
      top: {
        _id: selected.top._id,
        imageUrl: selected.top.imageUrl,
        color: selected.top.color,
        style: selected.top.style,
        formality: selected.top.formality,
      },

      bottom: {
        _id: selected.bottom._id,
        imageUrl: selected.bottom.imageUrl,
        color: selected.bottom.color,
        style: selected.bottom.style,
      },

      shoes: {
        _id: selected.shoe._id,
        imageUrl: selected.shoe.imageUrl,
        color: selected.shoe.color,
        style: selected.shoe.style,
      },

      compatibilityScore: selected.score.total,
      scoreBreakdown: selected.score.breakdown,

      outfitName: result.outfitName,
      stylingTip: result.stylingTip,
      whyItWorks: result.whyItWorks,
    };
  } catch (err) {
    console.error("LLM selection failed:", err);

    // Fallback: return best scored outfit
    const fallback = topCombinations[0];

    return {
      top: fallback.top,
      bottom: fallback.bottom,
      shoes: fallback.shoe,
      compatibilityScore: fallback.score.total,
      scoreBreakdown: fallback.score.breakdown,
      outfitName: "Recommended Outfit",
      stylingTip: "Try pairing these items for a balanced look.",
      whyItWorks:
        "This combination scores highest based on color and style compatibility.",
      isFallback: true,
    };
  }
}

export { selectBestOutfit };