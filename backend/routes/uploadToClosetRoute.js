import express from "express";
import multer from "multer";
import fs from "fs";
import { removeBackground } from "@imgly/background-removal-node";
import cloudinary from "../src/lib/cloudinary.js";
import Cloth from "../src/models/Cloth.js";

const router = express.Router();

const UPLOAD_DIR = "uploads/";
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const upload = multer({ dest: UPLOAD_DIR });

router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }
  const { category, gender, userId } = req.body;
  if (!category || !gender || !userId) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res
      .status(400)
      .json({ error: "Category, Gender, and UserId are required" });
  }

  const inputPath = req.file.path;

  try {
    const blob = await removeBackground(inputPath);
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "outfits/processed",
        format: "png",
      },
      async (error, result) => {
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
          await cloudinary.uploader.destroy(result.public_id);
          return res
            .status(500)
            .json({ error: "Failed to save outfit to database" });
        }
      },
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
    let query = { userId: userId };
    if (gender) {
      query.gender = gender;
    }
    const clothes = await Cloth.find(query).sort({ createdAt: -1 }); 

    res.json({
      success: true,
      data: clothes,
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ error: "Could not fetch clothes" });
  }
});


router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const cloth = await Cloth.findById(id);
    if (!cloth) {
      return res.status(404).json({ error: "Cloth not found" });
    }

    if (cloth.userId.toString() !== userId) {
      return res.status(403).json({ error: "Forbidden: not the owner" });
    }

    if (cloth.publicId) {
      try {
        await cloudinary.uploader.destroy(cloth.publicId, { resource_type: "image" });
      } catch (err) {
        console.error("Cloudinary destroy error:", err);
      }
    }

    await Cloth.deleteOne({ _id: id });

    res.json({ success: true, message: "Cloth deleted" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Failed to delete cloth" });
  }
});

export default router;
