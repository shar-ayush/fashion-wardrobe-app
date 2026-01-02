import express from "express";
import multer from "multer";
import fs from "fs";
import { removeBackground } from "@imgly/background-removal-node";
import cloudinary from "../src/lib/cloudinary.js";
import Cloth from "../src/models/Cloth.js";


const router = express.Router();

// Multer: temp upload folder
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }
  const { category, gender, userId } = req.body;
  if (!category || !gender || !userId) {
    // Cleanup if validation fails
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res
      .status(400)
      .json({ error: "Category, Gender, and UserId are required" });
  }

  const inputPath = req.file.path;

  try {
    // Remove background using Imgly
    const blob = await removeBackground(inputPath);
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload cleaned image to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "outfits/processed",
        format: "png",
      },
      async (error, result) => {
        // cleanup temp file
        try {
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        } catch (e) {
          console.error("Cleanup failed", e);
        }

        if (error) {
          console.error("Cloudinary upload error:", error);
          const message = error?.message || "Cloudinary upload failed";
          return res.status(500).json({ error: message });
        }

        try {
          console.log("Saving to DB...");

          const newCloth = new Cloth({
            userId: userId,
            imageUrl: result.secure_url,
            publicId: result.public_id,
            gender: gender,
            type: category, 
          });

          const savedCloth = await newCloth.save();

          return res.json({
            success: true,
            data: savedCloth,
            message: "Outfit processed and saved successfully",
          });
        } catch (error) {
          console.error("Database Error:", error);
          // Cleanup Cloudinary image if DB fails (prevents orphans)
          await cloudinary.uploader.destroy(result.public_id);
          return res
            .status(500)
            .json({ error: "Failed to save outfit to database" });
        }
      }
    );

    uploadStream.end(buffer);
  } catch (error) {
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    res.status(500).json({ error: "Background removal failed" });
  }
});


router.get("/", async (req, res) => {
  const { userId, gender } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // 1. Build the query
    // We want clothes for this user. 
    // If a gender is passed (e.g. ?gender=male), we filter by that too.
    let query = { userId: userId };
    if (gender) {
      query.gender = gender;
    }

    // 2. Fetch from MongoDB
    const clothes = await Cloth.find(query).sort({ createdAt: -1 }); // Newest first

    // 3. Send back the raw list
    // (We will filter them into 'tops', 'pants', etc. on the Frontend)
    res.json({
      success: true,
      data: clothes
    });

  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ error: "Could not fetch clothes" });
  }
});


export default router;
