import express from 'express';
import User from "../src/models/user.js";
import SavedOutfit from '../src/models/savedOutfit.js';
import authenticateToken from '../src/middleware/authMiddleware.js';
const router = express.Router();

router.post("/save-outfit", authenticateToken,async (req, res) => {
    try {
        const {date, items, caption, occasion, visibility, isOotd} = req.body;
        const userId = req.user.id;

        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const itemsWithImages = items?.map((item) => {
            if(!item || typeof item !== 'object') {
                console.warn("Invalid item skipped:", item);
                return null;
            }
            let imageUrl = item?.image;
            if(!imageUrl || !imageUrl.match(/^https?:\/\/res\.cloudinary\.com/)){
                console.warn("Invalid or non-Cloudinary image URL :", imageUrl);
                return null;
            }
            return {
                id: item.id !== undefined || "null",
                type: item.type || "unknown",
                image: imageUrl,
                x: item.x !== undefined ? item.x : 0,
                y: item.y !== undefined ? item.y : 0,
                
            };
        })

        const validItems = itemsWithImages.filter(item => item !== null);
        if(validItems.length === 0){
            return res.status(400).json({ message: "No valid items  provided" });
        }   

        const newOutfit =  new SavedOutfit({
            userId: user._id,
            date,
            items: validItems,
            caption: caption || "",
            occasion: occasion || "",
            visibility: visibility || "Everyone",
            isOotd: isOotd || false
        })
        await newOutfit.save();

        user.outfits.push(newOutfit._id);
        await user.save();

        res.status(201).json({ outfit: newOutfit });

    } catch (error) {
        console.log("Error in saving outfit",error.message);
        res.status(500).json({ message: "Server error in saving outfit" });
    }
});

export default router;