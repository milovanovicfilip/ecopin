import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from "cors";
import { userRouter } from "./routers/User.Router.js";
import { siteRouter } from "./routers/Site.Router.js";
import { POIRouter } from "./routers/Overpass.Router.js";
import { fileURLToPath } from "url";
import path from "path";
import { generateKey } from "crypto";

dotenv.config()

var mongodb = "mongodb+srv://milovanovic8filip:geslo123@cluster0.gsr8kmn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongodb);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const app = express();
const PORT = process.env.PORT || 3001;


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
    origin: 'http://localhost:3000',
}));

mongoose.connect(process.env.MONGO_DB)
    .then(() => {
        console.log("Connected to DB.");
    })
    .catch((err) => {
        console.error("Failed to connect to DB:", err);
    });

/*const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "..", "client", "build")));

app.get('*', (req, res) => {                       
    res.sendFile(path.resolve(__dirname, "..", "client", "build", "index.html"));
});*/
app.use('/api', siteRouter)
app.use('/api/user', userRouter);
app.use('/api/overpass', POIRouter);

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}/`);
});
