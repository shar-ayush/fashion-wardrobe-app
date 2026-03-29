import { OpenRouter } from "@openrouter/sdk";

const OPEN_ROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY;

const openrouter = new OpenRouter({
  apiKey: OPEN_ROUTER_API_KEY,
});

function extractJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}

async function extractIntent(userQuery) {
  const stream = await openrouter.chat.send({
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
          content: `
Extract outfit intent from this query: "${userQuery}"

Return ONLY valid JSON.

Schema:
{
  "occasions": one of [casual, formal, party, office, date, gym, travel, wedding] or null,
  "formality": one of [casual, semi-formal, formal] or null,
  "season": one of [summer, winter, spring, autumn] or null,
  "weatherSuitability": one of [hot, cold, mild, rain] or null,
  "style": array from [casual, formal, streetwear, minimal, sporty, ethnic] or []
}
        `,
        },
      ],

      temperature: 0.2, 
      stream: true,
    },
  });

  let fullResponse = "";

  console.log("Streaming response:\n");

  for await (const chunk of stream) {
    const content = chunk.choices?.[0]?.delta?.content;

    if (content) {
      fullResponse += content;
      process.stdout.write(content);
    }

    if (chunk.usage) {
      console.log("\n\nReasoning tokens:", chunk.usage.reasoningTokens);
    }
  }

  const cleaned = extractJSON(fullResponse);

  if (!cleaned) {
    console.log("No JSON found");
  } else {
    try {
      const parsed = JSON.parse(cleaned);
      console.log("Parsed JSON:\n", parsed);
      return parsed;
    } catch (err) {
      console.error("JSON parsing failed");
      console.error(cleaned);
      return null;
    }
  }
}

export  {extractIntent};
