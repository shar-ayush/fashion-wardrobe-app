import express from 'express';
import {connectDB} from './lib/db.js';
import cors from 'cors';
import 'dotenv/config'
import path from 'path';


import authRoutes from '../src/routes/authRoutes.js';
import savedOutfitsRoutes from '../src/routes/savedOutfitsRoute.js';
import smartSearchRoutes from '../src/routes/smartSearchRoutes.js';
import uploadToClosetRoute from '../src/routes/uploadToClosetRoute.js';
import tryOnRoutes from '../src/routes/tryOnRoutes.js';
import outfitMakerRoutes from "../src/routes/outfitMaker.routes.js";

import {seedOutfitdata} from "../src/lib/seedOutfitData.js";


// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

// Serve generated public files (tryon results)
app.use('/public', express.static(path.join(process.cwd(), 'public')));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/save-outfit", savedOutfitsRoutes);
app.use('/api/smart-search', smartSearchRoutes);
app.use('/api/upload-to-closet', uploadToClosetRoute);
app.use("/api/try-on", tryOnRoutes);
app.use("/api/outfit-maker", outfitMakerRoutes);



app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await connectDB();
    // await seedOutfitdata();
})
