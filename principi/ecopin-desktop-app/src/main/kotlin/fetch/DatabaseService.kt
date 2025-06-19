package org.example.fetch

import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import kotlinx.serialization.Serializable
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.*
import java.time.Instant

@Serializable
data class DatabasePOI(
    val location: Location,
    val type: String,
)

@Serializable
data class Location(
    val type: String = "Point",
    val coordinates: List<Double>
)

@Serializable
data class Type(
    val type: String
)

object DatabaseService {
    private const val BASE_URL = "http://localhost:5000/api/poi"
    private val client = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json {
                prettyPrint = true
                isLenient = true
                ignoreUnknownKeys = true
                encodeDefaults = true  // Add this line
            })

        }
    }

    suspend fun deleteAllPOIs(): Boolean {
        println("Attempting to delete all POIs...")
        return try {
            val response = client.delete("$BASE_URL/all")
            println("Delete response: ${response.status}")
            if (!response.status.isSuccess()) {
                println("(!) Delete failed, response body: ${response.bodyAsText()}")
            }
            response.status.isSuccess()
        } catch (e: Exception) {
            println("(!) Delete error: ${e.message}")
            false
        }
    }

    suspend fun insertPOI(poi: POI): Boolean {
        println("Attempting to insert POI: $poi")
        return try {
            val dbPOI = DatabasePOI(
                location = Location(coordinates = listOf(poi.coordinates.first, poi.coordinates.second)),
                type = poi.type
            )

            println("Sending JSON: ${Json.encodeToString(DatabasePOI.serializer(), dbPOI)}")

            val response = client.post(BASE_URL) {
                contentType(ContentType.Application.Json)
                setBody(dbPOI)
            }

            println("Insert response: ${response.status}")
            response.status.isSuccess()
        } catch (e: Exception) {
            println("Insert error: ${e.message}")
            e.printStackTrace()
            false
        }
    }

    suspend fun editPOItype(poi: POI, type: String): Boolean {
        println("Attempting to edit POI type...")
        return try {
            val id = poi.id;
            val typeJson = Type(type)
            val response = client.put("$BASE_URL/$id") {
                contentType(ContentType.Application.Json)
                setBody(typeJson)
            }
            println("Edit response: ${response.status}")
            if (!response.status.isSuccess()) {
                println("(!) Edit failed, response body: ${response.bodyAsText()}")
            }
            response.status.isSuccess()
        } catch (e: Exception) {
            println("(!) Edit error: ${e.message}")
            e.printStackTrace()
            false
        }
    }

    suspend fun deletePOI(poi: POI): Boolean {
        println("Attempting to delete POI...")
        return try {
            val id = poi.id;
            val response = client.delete("$BASE_URL/$id")
            println("Delete response: ${response.status}")
            response.status.isSuccess()
        } catch (e: Exception) {
            println("(!) Delete error: ${e.message}")
            e.printStackTrace()
            false
        }
    }

    suspend fun insertPOIs(pois: List<POI>): Boolean {
        println("Attempting to insert ${pois.size} POIs in chunks of 500...")
        val chunkSize = 500
        val chunks = pois.chunked(chunkSize)

        for ((index, chunk) in chunks.withIndex()) {
            println("Sending chunk ${index + 1}/${chunks.size} with ${chunk.size} POIs...")

            val dbPOIs = chunk.map {
                DatabasePOI(
                    location = Location(coordinates = listOf(it.coordinates.first, it.coordinates.second)),
                    type = it.type
                )
            }

            try {
                val response = client.post("$BASE_URL/all") {
                    contentType(ContentType.Application.Json)
                    setBody(dbPOIs)
                }

                println("Batch ${index + 1} response: ${response.status}")
                if (!response.status.isSuccess()) {
                    println("(!) Failed batch ${index + 1}: ${response.bodyAsText()}")
                    return false
                }
            } catch (e: Exception) {
                println("(!) Exception in batch ${index + 1}: ${e.message}")
                e.printStackTrace()
                return false
            }
        }

        return true
    }


    suspend fun getAllPOIs(): List<POI> {
        println("Fetching all POIs from database...")
        return try {
            val response = client.get(BASE_URL)
            println("GET response: ${response.status}")
            val jsonResponse = Json.parseToJsonElement(response.bodyAsText())

            jsonResponse.jsonArray.mapNotNull { element ->
                try {
                    val obj = element.jsonObject
                    val location = obj["location"]?.jsonObject
                    val coordinatesArray = location?.get("coordinates")?.jsonArray

                    val coordList = coordinatesArray?.mapNotNull { coordElem ->
                        when (coordElem) {
                            is JsonPrimitive -> coordElem.doubleOrNull
                            is JsonObject -> coordElem["\$numberDouble"]?.jsonPrimitive?.content?.toDoubleOrNull()
                                ?: coordElem["\$numberInt"]?.jsonPrimitive?.content?.toDoubleOrNull()
                            else -> null
                        }
                    } ?: listOf(0.0, 0.0)

                    val updatedAtString = obj["updatedAt"]?.jsonPrimitive?.content
                    val updatedAtEpochMillis = try {
                        Instant.parse(updatedAtString).toEpochMilli()
                    } catch (e: Exception) {
                        null
                    }

                    POI(
                        type = obj["type"]?.jsonPrimitive?.content ?: "unknown",
                        coordinates = Pair(coordList.getOrElse(0) { 0.0 }, coordList.getOrElse(1) { 0.0 }),
                        id = obj["_id"]?.jsonPrimitive?.content,
                        updatedAt = updatedAtEpochMillis
                    )
                } catch (e: Exception) {
                    println("Error parsing POI element: ${e.message}")
                    null
                }
            }.sortedByDescending { it.updatedAt ?: 0L }
        } catch (e: Exception) {
            println("Fetch error: ${e.message}")
            emptyList()
        }
    }
}