import express from 'express';
import {connectDB} from './lib/db.js'
import cors from 'cors';
import 'dotenv/config'
import {audioToAudio, HfInference} from '@huggingface/inference';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());



app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await connectDB();
})
