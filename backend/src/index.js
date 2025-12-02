import express from 'express';
import {connectDB} from './lib/db.js'
import cors from 'cors';
import 'dotenv/config'
// import {audioToAudio, HfInference} from '@huggingface/inference';

import authRoutes from '../routes/authRoutes.js'
import savedOutfitsRoutes from '../routes/savedOutfitsRoute.js';


// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/", savedOutfitsRoutes);



app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await connectDB();
})
