import * as dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import { userRouter } from "./routers/User.Router.js";
import { siteRouter } from "./routers/Site.Router.js";
import { fileURLToPath } from "url";
import path from "path";
import { generateKey } from "crypto";

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
    origin: 'http://localhost:3000',
}));

app.use('/api', siteRouter)
app.use('/api/user', userRouter);

mongoose.connect(process.env.MONGO_DB)
    .then(() => {
        console.log("Connected to DB.");
    })
    .catch((err) => {
        console.error("Failed to connect to DB:", err);
    });

const PORT = process.env.PORT || 3001;

/*const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "..", "client", "build")));

app.get('*', (req, res) => {                       
    res.sendFile(path.resolve(__dirname, "..", "client", "build", "index.html"));
});*/

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}/`);
});
