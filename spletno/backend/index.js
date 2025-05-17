import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from "cors";
import POIRouter from "./routers/Overpass.Router.js";
import { schedulePOIFetch } from './services/schedule.js';
dotenv.config()

const app = express();
const PORT = process.env.PORT || 3001;


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
    origin: 'http://localhost:3000',
}));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to DB.");
    })
    .catch((err) => {
        console.error("Failed to connect to DB:", err);
    });

app.use('/api/overpass', POIRouter);

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}/`);
});

schedulePOIFetch();