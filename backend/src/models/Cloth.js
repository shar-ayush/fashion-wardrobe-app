import mongoose from "mongoose";

const clothSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    gender: {
      type: String,
      enum: ["female", "male", "unisex"],
      required: true,
    },
    category: {
      type: String,
      enum: ["top", "bottom", "footwear", "outerwear", "accessory"],
      required: true,
    },
    subCategory: {
      type: String,
      default: "unknown",
    },
    color: {
      primary: { type: String, default: "unknown" },
      secondary: { type: [String], default: [] },
    },
    style: { type: [String], default: [] },
    fabric: { type: String, default: "unknown" },
    fit: { type: String, default: "regular" },
    pattern: { type: String, default: "solid" },
    season: { type: [String], default: [] },
    occasions: { type: [String], default: [] },
    formality: {
      type: String,
      enum: ["casual", "semi-formal", "formal"],
      default: "casual",
    },

    weatherSuitability: { type: [String], default: [] },
    embeddingHint: { type: String, default: "" },

    aiTagged: { type: Boolean, default: false },
  },
  { timestamps: true },
);

clothSchema.index({ userId: 1, category: 1 });
clothSchema.index({ occasions: 1 });
clothSchema.index({ formality: 1 });

export default mongoose.model("Cloth", clothSchema);
