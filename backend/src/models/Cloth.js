import mongoose from "mongoose";

const clothSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    imageUrl: { type: String, required: true },
    publicId: { type: String, required: true },

    gender: {
      type: String,
      enum: ["female", "male", "unisex"],
      required: true,
    },

    type: {
      type: String,
      enum: ["pants", "skirt", "shoes", "tops", "mshirts", "mpants"], 
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Cloth", clothSchema);
