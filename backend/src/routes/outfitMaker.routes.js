import express from "express";
import { generateOutfit } from "../controllers/outfitMaker.controller.js";
import authenticateToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", authenticateToken, generateOutfit);

export default router;