import * as dotenv from "dotenv";
dotenv.config();

import crypto from "crypto";
import { decodeJWT, genJWT } from "../utils/jwt.js";
import PoiModel from "../models/Poi.Model.js";

export default class SiteController{
    constructor(){}

    fetchData = async function (req, res) {
        try{
            const data = await PoiModel.find();
            return response.status(200).json(data);
        }
        catch(error){
            console.log(error);
            return response.status(500).json({message: 'An unexpected error occurred'});
        }
    }
}