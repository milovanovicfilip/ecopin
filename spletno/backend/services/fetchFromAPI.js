import fetch from 'node-fetch';
import POI from '../models/Poi.Model.js';

export const fetchPOIData = async () => {
    const query = `
    [out:json][timeout:180];
    area[name="Slovenija"]->.searchArea;

    (
    node["amenity"="waste_basket"](area.searchArea);
    node["amenity"="waste_disposal"](area.searchArea);
    node["amenity"="recycling"](area.searchArea);
    );
    out body;
    `;

    const response = await fetch(`https://overpass-api.de/api/interpreter`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`
    });

    const data = await response.json();

    await POI.deleteMany({}); 

    const points = data.elements
        .filter(el => el.type === "node" && el.lat && el.lon)
        .map(el => {
            let type = "unknown";
            if (el.tags?.amenity === "waste_basket") type = "bin";
            if (el.tags?.amenity === "waste_disposal") type = "disposal-site";
            if (el.tags?.amenity === "recycling") type = "eco-island";

            return {
                type,
                location: {
                    type: "Point",
                    coordinates: [el.lon, el.lat],
                    address: null
                },
                description: el.tags?.description || "",
                status: "active",
            };
        });
    
        
    const insertedPOIs = await POI.insertMany(points, { ordered: false });
    console.log(`Inserted ${insertedPOIs.length} POIs`);
    return points;
};