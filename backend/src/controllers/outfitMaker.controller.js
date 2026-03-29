import { extractIntent } from "../services/outfitMaker/extractIntent.js";
import { filterWithFallback } from "../services/outfitMaker/filterWardrobe.js";
import { getTopCombinations } from "../services/outfitMaker/compatibilityScorer.js";
import { selectBestOutfit } from "../services/outfitMaker/selectOutfit.js";
import Cloth from "../models/Cloth.js";
import mongoose from "mongoose";

async function generateOutfit(req, res) {
  try {
    const { query } = req.body;
    let userId = req.user.id || req.user._id;
    if (typeof userId === "string") {
      userId = new mongoose.Types.ObjectId(userId);
    }

    // Guard: ensure enough clothes
    const counts = await Cloth.aggregate([
      { $match: { userId, aiTagged: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const countMap = Object.fromEntries(
      counts.map((c) => [c._id, c.count])
    );

    if (!countMap.top || !countMap.bottom || !countMap.footwear) {
      return res.status(400).json({
        error: "not_enough_clothes",
        message: `You need at least one top, bottom, and footwear. Missing: ${
          [
            !countMap.top && "top",
            !countMap.bottom && "bottom",
            !countMap.footwear && "footwear",
          ]
            .filter(Boolean)
            .join(", ")
        }`,
      });
    }

    // Stage 1: Extract intent
    const intent = await extractIntent(query);
    console.log("Intent:", intent);

    // Stage 2: Filter wardrobe
    const candidates = await filterWithFallback(userId, intent);

    console.log(
      `Candidates: ${candidates.top.length} tops, ${candidates.bottom.length} bottoms, ${candidates.footwear.length} footwear`
    );

    // Stage 3: Score combinations
    const topCombinations = getTopCombinations(
      candidates,
      intent.occasions
    );

    if (!topCombinations.length) {
      return res.status(400).json({
        error: "no_combinations",
        message:
          "Could not generate combinations. Please add more clothes to your wardrobe.",
      });
    }

    // Stage 4: LLM selection
    const outfit = await selectBestOutfit(
      topCombinations,
      query,
      intent
    );

    return res.status(200).json({
      success: true,
      query,
      intent,
      outfit,
      wasRelaxed: candidates.wasRelaxed,
      message: candidates.wasRelaxed
        ? "Some items may not perfectly match your request — add more clothes for better results!"
        : null,
    });
  } catch (err) {
    console.error("Outfit generation error:", err);

    return res.status(500).json({ error: "server_error", message: err.message,});
  }
}

export { generateOutfit };