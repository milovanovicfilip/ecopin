package org.example.fetch

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.*
import kotlinx.serialization.json.*

@Serializable
data class SURSQuery(
    val query: List<QueryItem>,
    val response: ResponseFormat
)

@Serializable
data class QueryItem(
    val code: String,
    val selection: Selection
)

@Serializable
data class Selection(
    val filter: String,
    val values: List<String>
)

@Serializable
data class ResponseFormat(val format: String)

@Serializable
data class ApiResponse(
    val dataset: Dataset
)

@Serializable
data class Dataset(
    val dimension: Dimensions,
    val value: List<Int>,
    val label: String
)

@Serializable
data class Dimensions(
    val OBČINE: MunicipalityDimension,
    val LETO: YearDimension
)

@Serializable
data class MunicipalityDimension(
    val label: String,
    val category: Category
) {
    @Serializable
    data class Category(
        val index: Map<String, Int>,
        val label: Map<String, String>
    )
}

@Serializable
data class YearDimension(
    val label: String,
    val category: Category
) {
    @Serializable
    data class Category(
        val index: Map<String, Int>,
        val label: Map<String, String>
    )
}

@Serializable
data class MunicipalityData(
    val code: String,
    val name: String,
    val year: String,
    val value: Int
)

suspend fun fetchAllMunicipalityData(): List<MunicipalityData> {
    val client = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                prettyPrint = true
            })
        }
    }

    val allMunicipalityCodes = listOf(
        "0",
        "001",
        "213",
        "195",
        "002",
        "148",
        "149",
        "003",
        "150",
        "004",
        "005",
        "006",
        "151",
        "007",
        "008",
        "009",
        "152",
        "011",
        "012",
        "013",
        "014",
        "153",
        "196",
        "015",
        "016",
        "017",
        "018",
        "019",
        "154",
        "020",
        "155",
        "021",
        "156",
        "022",
        "157",
        "023",
        "024",
        "025",
        "026",
        "027",
        "028",
        "207",
        "029",
        "030",
        "031",
        "158",
        "032",
        "159",
        "160",
        "161",
        "162",
        "034",
        "035",
        "036",
        "037",
        "038",
        "039",
        "040",
        "041",
        "163",
        "042",
        "043",
        "044",
        "045",
        "046",
        "047",
        "048",
        "049",
        "164",
        "050",
        "197",
        "165",
        "051",
        "052",
        "053",
        "166",
        "054",
        "055",
        "056",
        "057",
        "058",
        "059",
        "060",
        "061",
        "062",
        "063",
        "208",
        "064",
        "065",
        "066",
        "167",
        "067",
        "068",
        "069",
        "198",
        "070",
        "168",
        "071",
        "072",
        "073",
        "074",
        "169",
        "075",
        "212",
        "170",
        "076",
        "199",
        "077",
        "078",
        "079",
        "080",
        "081",
        "082",
        "083",
        "084",
        "085",
        "086",
        "171",
        "087",
        "088",
        "089",
        "090",
        "091",
        "092",
        "172",
        "093",
        "200",
        "173",
        "094",
        "174",
        "095",
        "175",
        "096",
        "097",
        "098",
        "099",
        "100",
        "101",
        "102",
        "103",
        "176",
        "209",
        "201",
        "104",
        "177",
        "106",
        "105",
        "107",
        "108",
        "178",
        "109",
        "110",
        "111",
        "112",
        "113",
        "114",
        "179",
        "180",
        "202",
        "115",
        "203",
        "181",
        "204",
        "182",
        "116",
        "210",
        "205",
        "033",
        "183",
        "117",
        "118",
        "119",
        "120",
        "211",
        "121",
        "122",
        "123",
        "124",
        "206",
        "125",
        "194",
        "126",
        "127",
        "184",
        "010",
        "128",
        "129",
        "130",
        "185",
        "186",
        "131",
        "132",
        "133",
        "187",
        "134",
        "188",
        "135",
        "136",
        "137",
        "138",
        "139",
        "189",
        "140",
        "141",
        "142",
        "143",
        "144",
        "190",
        "146",
        "191",
        "147",
        "192",
        "193"
    )

    return try {
        val payload = SURSQuery(
            query = listOf(
                QueryItem("OBČINE", Selection("item", allMunicipalityCodes)),
                QueryItem("LETO", Selection("item", listOf("2021")))
            ),
            response = ResponseFormat("json-stat")
        )

        val response: ApiResponse = client.post("https://pxweb.stat.si/SiStatData/api/v1/sl/Data/0861106S.PX") {
            contentType(ContentType.Application.Json)
            setBody(payload)
        }.body()

        parseResponse(response)
    } finally {
        client.close()
    }
}

suspend fun fetchCityData() {
    val data = fetchAllMunicipalityData()
    println("\n%-5s %-30s %s".format("Koda", "Občina", "Število prebivalcev"))
    println("----------------------------------------")
    data.sortedBy { it.code }.forEach {
        println("%-5s %-30s %,d".format(it.code, it.name, it.value))
    }
    println("\nSkupaj občin: ${data.size}")
    println("Skupaj prebivalcev: ${data.sumOf { it.value }}")
}

fun parseResponse(response: ApiResponse): List<MunicipalityData> {
    val municipalities = response.dataset.dimension.OBČINE.category
    val year = response.dataset.dimension.LETO.category.label.values.first()
    val values = response.dataset.value

    return municipalities.index.map { (code, index) ->
        MunicipalityData(
            code = code,
            name = municipalities.label[code] ?: "Unknown",
            year = year,
            value = values.getOrElse(index) { 0 }
        )
    }
}