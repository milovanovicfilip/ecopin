package org.example

import org.example.fetch.fetchAllMunicipalityData
import org.example.fetch.fetchCityData
import org.example.fetch.fetchPOIData
import org.example.fetch.fetchCollectionCenters
import java.util.*


suspend fun main() {
    val scanner = Scanner(System.`in`)

    println("Izberi podatke:")
    println("1 - Število prebivalcev v vsaki mestni občini v Sloveniji")
    println("2 - Lokacije odlagališč, eko-otokov in koših v Sloveniji")
    println("3 - Podatki o zbirnih centrih za ločeno zbrano odpadno nekomunalno embalažo")
    print("Vnesi izbiro (1, 2 ali 3): ")

    when (scanner.nextLine()) {
        "1" -> {
            fetchCityData()
        }
        "2" -> {
            fetchPOIData()
        }
        "3" -> {
            fetchCollectionCenters()
        }
        else -> {
            println("Napačen vnos. Prosimo, vnesite 1 ali 2.")
        }
    }

    scanner.close()
}