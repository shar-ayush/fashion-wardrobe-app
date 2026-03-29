import Cloth from "../../models/Cloth.js";
import mongoose from "mongoose";

async function filterWardrobeByIntent(userId, intent = {}) {
  const uid = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;
  const baseFilter = {
    userId: uid,
    aiTagged: true,
  };

  if (intent.occasions) {
    baseFilter.occasions = { $in: [intent.occasions] };
  }

  if (intent.formality) {
    if (intent.formality === "formal") {
      baseFilter.formality = { $in: ["formal", "semi-formal"] };
    } else if (intent.formality === "casual") {
      baseFilter.formality = { $in: ["casual", "semi-formal"] };
    } else {
      baseFilter.formality = intent.formality;
    }
  }

  if (intent.season) {
    baseFilter.season = { $in: [intent.season] };
  }

  if (intent.weatherSuitability) {
    baseFilter.weatherSuitability = { $in: [intent.weatherSuitability] };
  }
  
  if (intent.color) {
    baseFilter["color.primary"] = intent.color;
  }

  const projection = `
    _id imageUrl category subCategory color style 
    formality season occasions weatherSuitability
  `;

  // Fetch candidates per category in parallel
  const [top, bottom, footwear, outerwear, accessory] = await Promise.all([
    Cloth.find({ ...baseFilter, category: "top" })
      .select(projection)
      .limit(8),

    Cloth.find({ ...baseFilter, category: "bottom" })
      .select(projection)
      .limit(8),

    Cloth.find({ ...baseFilter, category: "footwear" })
      .select(projection)
      .limit(6),

    Cloth.find({ ...baseFilter, category: "outerwear" })
      .select(projection)
      .limit(4),

    Cloth.find({ ...baseFilter, category: "accessory" })
      .select(projection)
      .limit(4),
  ]);

  return { top, bottom, footwear, outerwear, accessory };
}

// IMPORTANT: Fallback if filters are too strict
async function filterWithFallback(userId, intent) {
  let candidates = await filterWardrobeByIntent(userId, intent);

  const hasEnough =
    candidates.top.length > 0 &&
    candidates.bottom.length > 0 &&
    candidates.footwear.length > 0;

  if (!hasEnough) {
    console.log("Filters too strict, falling back to no filters");

    const relaxed = await filterWardrobeByIntent(userId, {});

    return {
      top: candidates.top.length ? candidates.top : relaxed.top,
      bottom: candidates.bottom.length ? candidates.bottom : relaxed.bottom,
      footwear: candidates.footwear.length
        ? candidates.footwear
        : relaxed.footwear,
      outerwear: relaxed.outerwear,
      accessory: relaxed.accessory,
      wasRelaxed: true,
    };
  }

  return { ...candidates, wasRelaxed: false };
}

export { filterWithFallback };
