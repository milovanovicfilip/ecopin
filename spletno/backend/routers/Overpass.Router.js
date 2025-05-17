import express from 'express';
import {fetchPOIs} from '../controllers/POI.Controller.js';

const router = express.Router();

router.get('/overpass', fetchPOIs);

export default router; 