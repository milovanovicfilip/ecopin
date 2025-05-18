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
const PORT = process.env.PORT || 5000;


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use('/api/poi', poiRouter)
app.use('/api/report', reportRouter)
app.use('/api/user', userRouter);
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    auth0Domain: process.env.AUTH0_DOMAIN
  });
});

mongoose.connect(process.env.MONGO_DB)
    .then(() => {
        console.log("Connected to DB.");
    })
    .catch((err) => {
        console.error("Failed to connect to DB:", err);
    });


app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
  console.log(`Auth0 Domain: ${process.env.AUTH0_DOMAIN}`);
  console.log(`MongoDB Connected: ${mongoose.connection.readyState === 1 ? '✅' : '❌'}`);
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

process.on('SIGTERM', () => {
  server.close(() => {
    mongoose.connection.close();
    console.log('Server shut down gracefully');
    process.exit(0);
  });
});

schedulePOIFetch();