import express from "express";
import cosineSimilarity from "compute-cosine-similarity";
import Outfit from "../src/models/outfit.js";
import { generateEmbedding } from "../src/lib/seedOutfitData.js";

const router = express.Router();

const normalizeQuery = (query) => {
    const synonyms = {
        "coffee date": "coffee date",
        "dinner date": "date",
        "job interview": "interview",
        "work": "interview",
        "casual": "casual",
        "formal": "formal",
        "outfit": "",
        "give me": "",
        "a": "",
        "an": "",
        "for": "",
    };

    let normalized = query.toLowerCase();
    Object.keys(synonyms).forEach((key) => {
        normalized = normalized.replace(new RegExp(`\\b${key}\\b`, "gi"), synonyms[key]);
    })
    return [...new Set(normalized.trim().split(/\s+/).filter(Boolean))].join(" ");
}

router.get("/", async (req, res) => {
    const {query} = req.query;

    if(!query) return res.status(400).json({error: "Query is required."});

    try {
        const normalizedQuery = normalizeQuery(query);
        const queryEmbedding = await generateEmbedding(normalizedQuery);
        const outfits = await Outfit.find();

        const MIN_SIMILARITY = query.length > 20 ? 0.3 : 0.4;

        let scored = outfits
        .map((o) => {
            const score = cosineSimilarity(queryEmbedding, o.embedding);
            return {...o.toObject(), score};
        })
        .filter((o) => o.score >= MIN_SIMILARITY)
        .sort((a, b) => b.score - a.score);

        if(scored.length === 0) {
            const queryItems = normalizedQuery.split(" ");
            scored = outfits
                .filter((o) => 
                    queryItems.some(
                        (term) => 
                            o.occasion.toLowerCase().includes(term) ||
                            o.style.toLowerCase().includes(term) ||
                            o.items.some(item => item.toLowerCase().includes(term))
                    )
                )
                .map((o) => ({...o.toObject(), score: 0.1}));
      
        }

        res.json(scored.slice(0,5));
        
    } catch (error) {
        res.status(500).json({error: error.message});
    }
})

export default router;