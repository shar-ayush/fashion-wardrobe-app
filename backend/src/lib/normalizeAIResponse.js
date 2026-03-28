export const normalizeAIData = (data) => {
  if (!data || typeof data !== "object") {
    return getDefaultData();
  }

  return {
    category: normalizeCategory(data.category),
    subCategory: normalizeString(data.subCategory, "unknown"),
    color: {
      primary: normalizeString(data?.color?.primary, "unknown"),
      secondary: Array.isArray(data?.color?.secondary)
        ? data.color.secondary.map((c) => c.toLowerCase())
        : [],
    },
    style: normalizeArray(data.style),
    fabric: normalizeString(data.fabric, "unknown"),
    fit: normalizeFit(data.fit),
    pattern: normalizePattern(data.pattern),
    season: normalizeArray(data.season, 2), // limit to 2
    occasions: normalizeArray(data.occasions),
    weatherSuitability: normalizeArray(data.weatherSuitability),
    formality: normalizeFormality(data.formality),
    embeddingHint: normalizeString(data.embeddingHint, ""),
  };
};

const getDefaultData = () => ({
  category: "top",
  subCategory: "unknown",
  color: { primary: "unknown", secondary: [] },
  style: [],
  fabric: "unknown",
  fit: "regular",
  pattern: "solid",
  season: [],
  occasions: [],
  weatherSuitability: [],
  formality: "casual",
  embeddingHint: "",
});

const normalizeCategory = (category) => {
  const valid = ["top", "bottom", "footwear", "outerwear", "accessory"];
  if (!category) return "top";

  const clean = category.toLowerCase();
  return valid.includes(clean) ? clean : "top";
};

const normalizeString = (value, fallback) => {
  if (!value || typeof value !== "string") return fallback;
  return value.toLowerCase();
};

const normalizeArray = (arr, limit = null) => {
  if (!Array.isArray(arr)) return [];

  let cleaned = arr
    .filter((item) => typeof item === "string")
    .map((item) => item.toLowerCase());

  if (limit) {
    cleaned = cleaned.slice(0, limit);
  }

  return cleaned;
};

const normalizeFit = (fit) => {
  const valid = ["slim", "regular", "loose", "oversized"];
  if (!fit) return "regular";

  const clean = fit.toLowerCase();
  return valid.includes(clean) ? clean : "regular";
};

const normalizePattern = (pattern) => {
  const valid = ["solid", "striped", "printed", "checked", "graphic"];
  if (!pattern) return "solid";

  const clean = pattern.toLowerCase();
  return valid.includes(clean) ? clean : "solid";
};

const normalizeFormality = (formality) => {
  const valid = ["casual", "semi-formal", "formal"];
  if (!formality) return "casual";

  const clean = formality.toLowerCase();
  return valid.includes(clean) ? clean : "casual";
};