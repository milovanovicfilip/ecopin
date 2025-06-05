import UserModel from '../models/User.Model.js'
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGODB_URI;

const resetSeason = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await UserModel.find({});
    for (const user of users) {
      user.points = 0;
      user.seasonRewards = [];
      user.seasonCompleted = false;
      await user.save();
    }

    console.log("Successfully reset season for all users.");
    process.exit(0);
  } catch (err) {
    console.error("Error while season cleaning rewards:", err);
    process.exit(1);
  }
};

resetSeason();