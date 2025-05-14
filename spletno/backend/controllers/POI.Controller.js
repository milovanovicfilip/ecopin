import fetch from "node-fetch";
import {POI} from "../models/Poi.Model.js";

export const fetchPOIs = async (req, res) => {
    try{
        const query = `
        [out:json][timeout:25];
        (
            node["amenity" = "waste_basket"](area:3600051471);
            node["amenity" = "waste_disposal"](area:3600051471);
            node["amenity" = "eco-island"](area:3600051471);
        );
        out body;
        `;

        const response = await fetch(`https://overpass-api.de/api/interpreter`, {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: `data=${encodeURIComponent(query)}`
        });

        const data = await response.json();

        const points = data.elements
            .filter(el => el.type === "node" && el.lat && el.lon)
            .map(el => {
                let type = "bin";
                if(el.tags?.amenity === "eco-island") {
                    type = "eco-island";
                }
                if(el.tags?.amenity === "waste_disposal") {
                    type = "disposal-site";
                }

                return {
                    type,
                    location: {
                        type: "Point",
                        coords: [el.lon, el.lat],
                        address: null
                    },
                    description: el.tags?.description || "",
                    status: "active",
                    lastChecked: new Date()
                };
            });

        const insertedPOIs = await POI.insertMany(points, { ordered: false });

        res.json({
            message: "POIs fetched and inserted successfully",
            count: insertedPOIs.length
        });
    }catch(error) {
        console.error("Error fetching POIs:", error);
        res.status(500).json({ message: "Error fetching POIs", error });
    }    
};