import Outfit from "../models/outfit.js";
import {HfInference} from "@huggingface/inference";
const hf = new HfInference(`${process.env.HF_API_KEY}`);


export const generateEmbedding = async (text) => {
  const response = await hf.featureExtraction({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    inputs: text,
  });
  return response;
}

const seedOutfitdata = async () => {
  try {
    const count = await Outfit.countDocuments();
    if (count === 0) {
      const outfits = [
        {
          occasion: "date",
          style: "casual",
          items: ["White linen shirt", "Dark jeans", "Loafers"],
          image:
            "https://i.pinimg.com/736x/b2/6e/c7/b26ec7bc30ca9459b918ae8f7bf66305.jpg",
        },
        {
          occasion: "date",
          style: "elegant",
          items: ["White flared pants", "sandals", "sunglasses"],
          image:
            "https://i.pinimg.com/736x/8c/61/12/8c6112457ae46fa1e0aea8b8f5ed18ec.jpg",
        },
        {
          occasion: "coffee",
          style: "casual",
          items: [
            "cropped t-shirt",
            "wide-leg beige trousers",
            "Samba sneakers",
          ],
          image:
            "https://i.pinimg.com/736x/d7/2d/26/d72d268ca4ff150db1db560b25afb843.jpg",
        },
        {
          occasion: "interview",
          style: "formal",
          items: ["Light blue shirt", "wide-leg jeans", "Silver wristwatch"],
          image:
            "https://i.pinimg.com/736x/1c/50/bc/1c50bcef1b46efe5db4008252ea8cfa5.jpg",
        },
        {
          occasion: "beach",
          style: "beach",
          items: ["brown T shirt", "beige shorts", "Sunglasses"],
          image:
            "https://i.pinimg.com/1200x/86/57/59/8657592bd659335ffd081fdab10b87a4.jpg",
        },
      ];

      for(const outfit of outfits) {
        const text = `${outfit.occasion} ${outfit.style} ${outfit.items.join(", ")}`;
        const embedding = await generateEmbedding(text);

        await new Outfit({...outfit,embedding}).save();

      }
      console.log("Database seeded with", outfits.length, "outfits.");
    } else{
        console.log("Database already contains outfit data. Seeding skipped : ", count, "outfits found.");
    }
  } catch (error) {
    console.log("Seeding outfit data failed:", error);
  }
};

export {seedOutfitdata};