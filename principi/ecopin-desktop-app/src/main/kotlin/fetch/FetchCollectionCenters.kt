package org.example.fetch

import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import org.jsoup.Jsoup

data class CollectionCenter(
    val receiver: String,
    val location: String,
    val address: String,
    val workingHours: String
)

suspend fun fetchInterzeroCollectionCenters(): List<CollectionCenter> {
    val client = HttpClient(CIO)

    return try {
        val response: HttpResponse = client.get("https://interzero.si/nase-storitve/informacije-za-koncne-uporabnike/zbirni-centri-za-odpadne-produkte/")
        val html = response.bodyAsText()

        val doc = Jsoup.parse(html)

        val table = doc.selectFirst("table.ce-table") ?: return emptyList()
        val rows = table.select("tbody tr")

        rows.drop(1).dropLast(1).mapNotNull { row ->
            val columns = row.select("td")
            if (columns.size >= 4) {
                CollectionCenter(
                    receiver = columns[0].text().trim(),
                    location = columns[1].text().trim(),
                    address = columns[2].text().trim(),
                    workingHours = columns[3].text().trim()
                )
            } else {
                null
            }
        }
    } finally {
        client.close()
    }
}

suspend fun fetchCollectionCenters() {
    val centers = fetchInterzeroCollectionCenters()

    if (centers.isEmpty()) {
        println("Napaka pri pridobivanju podatkov o zbirnih centrih.")
        return
    }

    println("ZBIRNI CENTRI ZA ODPADNE PRODUKTE - INTERZERO")
    println("============================================")
    println("Število zbirnih centrov: ${centers.size}\n")

    centers.forEachIndexed { index, center ->
        println("${index + 1}. ${center.location}")
        println("   Prevzemnik: ${center.receiver}")
        println("   Naslov: ${center.address}")
        println("   Delovni čas: ${center.workingHours}")
        println()
    }
}
