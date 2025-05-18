import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import { userRouter } from "./routers/User.Router.js";
import { fileURLToPath } from "url";
import path from "path";
import { generateKey } from "crypto";
import { poiRouter } from "./routers/Poi.Router.js";
import { reportRouter } from "./routers/Report.Router.js";
import dotenv from 'dotenv';
import { schedulePOIFetch } from './services/schedule.js';
dotenv.config()

const app = express();
const PORT = process.env.PORT || 3001;


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
    origin: 'http://localhost:3000',
}));

app.use('/api/poi', poiRouter)
app.use('/api/report', reportRouter)
//app.use('/api/user', userRouter);

mongoose.connect(process.env.MONGO_DB)
    .then(() => {
        console.log("Connected to DB.");
    })
    .catch((err) => {
        console.error("Failed to connect to DB:", err);
    });


app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}/`);
});

schedulePOIFetch();