import express from "express";
import multer from "multer";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import cloudinary from "../src/lib/cloudinary.js";


const router = express.Router();

const UPLOAD_DIR = "uploads/";
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const upload = multer({ dest: UPLOAD_DIR });

router.post(
  "/",
  upload.fields([
    { name: "personImage", maxCount: 1 },
    { name: "apparelImage", maxCount: 1 },
  ]),
  async (req, res) => {
    const personFile = req.files?.personImage?.[0];
    const apparelFile = req.files?.apparelImage?.[0];

    if (!personFile || !apparelFile) {
      return res.status(400).json({ success: false, message: 'Missing personImage or apparelImage' });
    }

    const personPath = personFile.path;
    const apparelPath = apparelFile.path;

    try {
      const formData = new FormData();
      formData.append("image", fs.createReadStream(personPath));
      formData.append("image-apparel", fs.createReadStream(apparelPath));

      const response = await axios.post(
        "https://virtual-try-on7.p.rapidapi.com/results",
        formData,
        {
          headers: {
            "x-rapidapi-key": process.env.RAPIDAPI_KEY,
            "x-rapidapi-host": process.env.RAPIDAPI_HOST,
            ...formData.getHeaders(),
          },
          timeout: 90000,
        }
      );

      const base64 = response.data?.results?.[0]?.entities?.[0]?.image;

      if (!base64) {
        throw new Error('Invalid response from rapidapi: missing image');
      }

      const base64Image = base64.startsWith('data:')
        ? base64
        : `data:image/jpeg;base64,${base64}`;

      const cloudinaryResult = await cloudinary.uploader.upload(base64Image, {
        folder: "virtual_try_on_results",
        resource_type: "image",
      });

      try {
        fs.unlinkSync(personPath);
        fs.unlinkSync(apparelPath);
      } catch (e) {
        console.warn("Failed to delete temp files:", e.message);
      }

      res.json({
        success: true,
        imageUrl: cloudinaryResult.secure_url, 
      });
    } catch (err) {
      console.error("Try-on error:", err?.response?.data || err.message);

      try {
        if (fs.existsSync(personPath)) fs.unlinkSync(personPath);
        if (fs.existsSync(apparelPath)) fs.unlinkSync(apparelPath);
      } catch (e) {}

      res.status(500).json({ success: false, message: "Try-on failed" });
    }
  }
);

export default router;
