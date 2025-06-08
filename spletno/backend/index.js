import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import path from "path";
import { fileURLToPath } from "url";
import { generateKey } from "crypto";
import { poiRouter } from "./routers/Poi.Router.js";
import { reportRouter } from "./routers/Report.Router.js";
import { partnerRouter } from "./routers/Partner.Router.js";
import { userRouter } from './routers/User.Router.js'
import { schedulePOIFetch } from './services/schedule.js';
dotenv.config()
 
const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
  origin: ['http://20.73.3.104:3000','http://20.73.3.104' ],
  credentials: true
}));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/api/user', userRouter);
app.use('/api/poi', poiRouter)
app.use('/api/report', reportRouter)
app.use('/api/partners', partnerRouter)

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    auth0Domain: process.env.AUTH0_DOMAIN
  });
});

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB Connected: ✅");
    })
    .catch((err) => {
        console.error("MongoDB Connection Failed: ❌\nMessage: ", err);
    });


app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

schedulePOIFetch();
