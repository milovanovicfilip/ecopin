import { fetchPOIData } from "../services/fetchFromAPI.js";
import POI from "../models/Poi.Model.js";

export const fetchPOIs = async (req, res) => {
    try{
        const points = await fetchPOIData();
       
        console.log(`Inserted ${insertedPOIs.length} POIs`);

        res.json({
            message: "POIs fetched and inserted successfully",
            data: insertedPOIs.length
        });
    } catch (error) {
        console.error("Error fetching POIs:", error);
        res.status(500).json({
            message: "Error fetching POIs",
            error: error.message
        });
    }
};