package org.example.fetch

import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import java.net.URLEncoder

@Serializable
data class POI(
    val type: String,
    val coordinates: Pair<Double, Double>,
    val id: String? = null,
    val updatedAt: Long? = null  // Just store the raw timestamp
)

//Added List<POI>
suspend fun fetchPOIData(): List<POI> {
    val client = HttpClient(CIO)
    println("Starting Overpass data fetch...")

    try {
        val overpassQuery = """
            [out:json][timeout:180];
            area[name="Slovenija"]->.searchArea;
            (
                node["amenity"="waste_basket"](area.searchArea);
                node["amenity"="waste_disposal"](area.searchArea);
                node["amenity"="recycling"](area.searchArea);
            );
            out body;
        """.trimIndent()

        println("Executing Overpass query...")
        val response = client.post("https://overpass-api.de/api/interpreter") {
            contentType(ContentType.Application.FormUrlEncoded)
            setBody("data=${URLEncoder.encode(overpassQuery, "UTF-8")}")
        }

        println("Received Overpass response: ${response.status}")
        if (!response.status.isSuccess()) {
            println("(!) Overpass error: ${response.bodyAsText()}")
            return emptyList()
        }

        val jsonResponse = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        val elements = jsonResponse["elements"]?.jsonArray ?: emptyList()
        println("Found ${elements.size} elements")

        val pois = elements.mapNotNull { element ->
            val obj = element.jsonObject
            if (obj["type"]?.toString() != "\"node\"") return@mapNotNull null

            val lat = obj["lat"]?.toString()?.toDoubleOrNull()
            val lon = obj["lon"]?.toString()?.toDoubleOrNull()
            if (lat == null || lon == null) return@mapNotNull null

            val tags = obj["tags"]?.jsonObject
            val amenity = tags?.get("amenity")?.toString()?.removeSurrounding("\"")

            val type = when (amenity) {
                "waste_basket" -> "bin"
                "waste_disposal" -> "disposal-site"
                "recycling" -> "eco-island"
                else -> "unknown"
            }

            POI(type, lon to lat)
        }

        println("Processing ${pois.size} POIs...")

        // Database operations
        if (!DatabaseService.deleteAllPOIs()) {
            println("(!) Failed to clear database, aborting")
            return emptyList()
        }

        DatabaseService.insertPOIs(pois);

        println("Inserted ${pois.size} POIs successfully")

        val dbPOIs = DatabaseService.getAllPOIs()
        println("Retrieved ${dbPOIs.size} POIs from database")

        return dbPOIs

    } catch (e: Exception) {
        println("(!) Critical error in fetchPOIData: ${e.message}")
        e.printStackTrace()
        return emptyList()
    } finally {
        client.close()
        println("(OK) Finished fetchPOIData execution")
    }
}