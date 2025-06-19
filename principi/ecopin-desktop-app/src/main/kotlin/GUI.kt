package org.example

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.application
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlin.random.Random
import androidx.compose.runtime.*
import org.example.fetch.*
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.client.request.*
import io.ktor.http.*
import kotlinx.coroutines.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

enum class Screen {
    POI, CollectionCenter, Citydata, InfoPage
}

val client = HttpClient(CIO) {
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
            ignoreUnknownKeys = true
        })
    }
}

@Serializable
data class Location(
    val type: String = "Point",
    val coordinates: List<Double>
)

@Serializable
data class PoiPayload(
    val type: String,
    val location: Location
)

@Composable
fun App() {
    var selectedScreen by remember { mutableStateOf<Screen?>(null) }

    MaterialTheme {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFF6F5EE))
                .padding(16.dp)
        ) {
            Column(
                modifier = Modifier
                    .width(130.dp)
                    .fillMaxHeight()
                    .background(Color(0xFFF6F5EE))
                    .padding(end = 16.dp),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                // Navigation buttons
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = { selectedScreen = Screen.POI },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(
                            backgroundColor = Color(0xFF548A50),
                            contentColor = Color.White
                        )
                    ) {
                        Text("POI")
                    }

                    Button(
                        onClick = { selectedScreen = Screen.Citydata },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(
                            backgroundColor = Color(0xFF548A50),
                            contentColor = Color.White
                        )
                    ) {
                        Text("City data")
                    }

                    Button(
                        onClick = { selectedScreen = Screen.CollectionCenter },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(
                            backgroundColor = Color(0xFF548A50),
                            contentColor = Color.White
                        )
                    ) {
                        Text("Disposal centers")
                    }
                }

                //About button
                Button(
                    onClick = { selectedScreen = Screen.InfoPage },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(
                        backgroundColor = Color(0xFF888888),
                        contentColor = Color.White
                    )
                ) {
                    Icon(Icons.Default.Info, contentDescription = "About")
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("About")
                }
            }

            Divider(
                modifier = Modifier
                    .fillMaxHeight()
                    .width(1.dp),
                color = MaterialTheme.colors.onSurface.copy(alpha = 0.12f)
            )

            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(start = 16.dp)
            ) {
                when (selectedScreen) {
                    Screen.POI -> POIScreen()
                    Screen.Citydata -> CityDataScreen()
                    Screen.CollectionCenter -> CentersScreen()
                    Screen.InfoPage -> InfoPage()
                    null -> Text("Select an option from the left.")
                }
            }
        }
    }
}

//--------------------------------------------------------------------------------------------------------------------------------
@Composable
fun POIScreen() {
    var viewMode by remember { mutableStateOf("list") }
    var poiList by remember { mutableStateOf<List<POI>>(emptyList()) }
    var editIndex by remember { mutableStateOf(-1) }
    var editingPOI by remember { mutableStateOf<POI?>(null) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    val coroutineScope = rememberCoroutineScope()

    ScreenLayout(
        onAddClick = {
            editingPOI = null
            editIndex = -1
            viewMode = "form"
        },
        onListClick = { viewMode = "list" },
        onPullClick = {
            isLoading = true
            errorMessage = null
            coroutineScope.launch {
                try {
                    val fetched = withContext(Dispatchers.IO) {
                        fetchPOIData()
                    }
                    poiList = fetched
                } catch (e: Exception) {
                    errorMessage = "Failed to fetch data: ${e.message}"
                } finally {
                    isLoading = false
                }
            }
        },
        onGenerateClick = { viewMode = "generate" },
        onRefreshClick = {
            isLoading = true
            errorMessage = null
            coroutineScope.launch {
                try {
                    val fetched = withContext(Dispatchers.IO) {
                        DatabaseService.getAllPOIs()
                    }
                    poiList = fetched
                } catch (e: Exception) {
                    errorMessage = "Failed to fetch data: ${e.message}"
                } finally {
                    isLoading = false
                }
            }
        }
    ) {
        when (viewMode) {
            "list" -> {
                var selectedFilter by remember { mutableStateOf("All") }

                Column(modifier = Modifier.fillMaxSize()) {
                    if (isLoading) {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator()
                        }
                    } else if (errorMessage != null) {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = errorMessage!!,
                                color = Color.Red,
                                modifier = Modifier.padding(16.dp)
                            )
                        }
                    } else {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                            modifier = Modifier.padding(bottom = 8.dp)
                        ) {
                            Text("Filter by Type:", fontWeight = FontWeight.Medium)

                            DropdownMenuFilter(
                                selectedFilter = selectedFilter,
                                onFilterChange = { selectedFilter = it }
                            )
                        }

                        val filteredList = poiList.filter {
                            selectedFilter == "All" || it.type == selectedFilter
                        }

                        if (filteredList.isEmpty()) {
                            Box(
                                modifier = Modifier.fillMaxSize(),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = if (poiList.isEmpty()) "No POIs found. Click 'Pull Data' to fetch."
                                    else "No data found for selected filter.",
                                    color = Color.Gray
                                )
                            }
                        } else {
                            // Scrollable list
                            LazyColumn(
                                modifier = Modifier.fillMaxSize(),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                itemsIndexed(filteredList) { index, poi ->
                                    Card(
                                        modifier = Modifier.fillMaxWidth(),
                                        backgroundColor = Color.White,
                                        elevation = 2.dp
                                    ) {
                                        Column(modifier = Modifier.padding(12.dp)) {
                                            Text(
                                                text = "Type: ${poi.type}",
                                                fontWeight = FontWeight.Bold
                                            )
                                            Text(
                                                text = "Coordinates: (${"%.6f".format(poi.coordinates.first)}, ${"%.6f".format(poi.coordinates.second)})",
                                                color = Color.Gray
                                            )

                                            Row(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .padding(top = 8.dp),
                                                horizontalArrangement = Arrangement.End
                                            ) {
                                                Button(
                                                    onClick = {
                                                        editingPOI = poi
                                                        editIndex = index
                                                        viewMode = "form"
                                                    },
                                                    colors = ButtonDefaults.buttonColors(
                                                        backgroundColor = Color(0xFF3E6E3B),
                                                        contentColor = Color.White
                                                    ),
                                                    modifier = Modifier.height(36.dp)
                                                ) {
                                                    Text("Edit")
                                                }
                                                Spacer(modifier = Modifier.width(12.dp))
                                                Button(
                                                    onClick = {
                                                        coroutineScope.launch {
                                                            val success = DatabaseService.deletePOI(poi)
                                                            if (success) {
                                                                poiList = poiList.toMutableList().also {
                                                                    it.removeAt(index)
                                                                }
                                                            } else {
                                                                println("Failed to delete POI")
                                                            }
                                                        }
                                                    },
                                                    colors = ButtonDefaults.buttonColors(
                                                        backgroundColor = Color(0xFFB00020),
                                                        contentColor = Color.White
                                                    ),
                                                    modifier = Modifier.height(36.dp)
                                                ) {
                                                    Text("Delete")
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            "form" -> {
                POIAddForm(
                    poi = editingPOI,
                    onSave = { newPOI ->
                        poiList = poiList.toMutableList().also {
                            if (editIndex >= 0) {
                                it[editIndex] = newPOI
                            } else {
                                it.add(newPOI)
                            }
                        }
                        viewMode = "list"
                    },
                    onCancel = {
                        viewMode = "list"
                    }
                )
            }

            "generate" -> {
                GeneratePOIDialog { generated ->
                    poiList = poiList + generated
                    viewMode = "list"
                }
            }
        }
    }
}
@Composable
fun DropdownMenuFilter(selectedFilter: String, onFilterChange: (String) -> Unit) {
    var expanded by remember { mutableStateOf(false) }

    Box {
        Button(onClick = { expanded = true }) {
            Text(selectedFilter)
        }

        DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            listOf("All", "bin", "disposal-site", "eco-island").forEach { type ->
                DropdownMenuItem(onClick = {
                    onFilterChange(type)
                    expanded = false
                }) {
                    Text(type)
                }
            }
        }
    }
}
@Composable
fun GeneratePOIDialog(onGenerate: (List<POI>) -> Unit) {
    var countText by remember { mutableStateOf("10") }
    var selectedType by remember { mutableStateOf("bin") }
    val types = listOf("bin", "disposal-site", "eco-island")
    var dropdownExpanded by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = {},
        title = { Text("Generate Fake POIs") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                TextField(
                    value = countText,
                    onValueChange = { countText = it },
                    label = { Text("Number of POIs") },
                    singleLine = true
                )

                Box {
                    Button(onClick = { dropdownExpanded = true }) {
                        Text("Type: $selectedType")
                    }
                    DropdownMenu(
                        expanded = dropdownExpanded,
                        onDismissRequest = { dropdownExpanded = false }
                    ) {
                        types.forEach {
                            DropdownMenuItem(onClick = {
                                selectedType = it
                                dropdownExpanded = false
                            }) {
                                Text(it)
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(onClick = {
                val count = countText.toIntOrNull() ?: return@Button
                val generated = List(count) {
                    POI(
                        type = selectedType,
                        coordinates = Pair(
                            Random.nextDouble(13.38, 16.61), // longitude
                            Random.nextDouble(45.42, 46.88)  // latitude
                        )
                    )
                }
                generated.forEach {
                    CoroutineScope(Dispatchers.IO).launch {
                        val success = DatabaseService.insertPOI(it)
                        if (success) {
                            println("POI inserted successfully")
                        } else {
                            println("Failed to insert POI")
                        }
                    }
                }
                onGenerate(generated)
            }) {
                Text("Generate")
            }
        },
        dismissButton = {}
    )
}
@Composable
fun POIAddForm(
    poi: POI? = null,
    onSave: (POI) -> Unit,
    onCancel: () -> Unit
) {
    var type by remember { mutableStateOf("") }
    var longitude by remember { mutableStateOf(poi?.coordinates?.first?.toString() ?: "") }
    var latitude by remember { mutableStateOf(poi?.coordinates?.second?.toString() ?: "") }

    val types = listOf("bin", "disposal-site", "eco-island")

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFFF6F5EE))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = if (poi == null) "Add POI" else "Edit POI",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold
        )

        // Type dropdown
        var typeDropdownExpanded by remember { mutableStateOf(false) }
        Box {
            Button(onClick = { typeDropdownExpanded = true }) {
                Text("Type: $type")
            }
            DropdownMenu(expanded = typeDropdownExpanded, onDismissRequest = { typeDropdownExpanded = false }) {
                types.forEach {
                    DropdownMenuItem(onClick = {
                        type = it
                        typeDropdownExpanded = false
                    }) {
                        Text(it)
                    }
                }
            }
        }
        if (poi == null) {
            TextField(
                value = longitude,
                onValueChange = { longitude = it },
                label = { Text("Longitude") },
                singleLine = true
            )

            TextField(
                value = latitude,
                onValueChange = { latitude = it },
                label = { Text("Latitude") },
                singleLine = true
            )
        }

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(
                onClick = {
                    if (poi == null) {
                        val lon = longitude.toDoubleOrNull()
                        val lat = latitude.toDoubleOrNull()
                        if (lon != null && lat != null && type != null) {
                            val poi = POI(type = type, coordinates = Pair(lon, lat))
                            onSave(poi)  // keep your original logic

                            // Launch coroutine to call suspend function
                            CoroutineScope(Dispatchers.IO).launch {
                                val success = DatabaseService.insertPOI(poi)
                                if (success) {
                                    println("POI inserted successfully")
                                } else {
                                    println("Failed to insert POI")
                                }
                            }
                        }
                    } else {
                        if (type != null) {
                            val poi = poi.copy(type = type)
                            onSave(poi)

                            CoroutineScope(Dispatchers.IO).launch {
                                val success = DatabaseService.editPOItype(poi, type)
                                if (success) {
                                    println("POI type updated successfully")
                                } else {
                                    println("Failed to update POI type")
                                }
                            }
                        }
                    }
                },
                colors = ButtonDefaults.buttonColors(backgroundColor = Color(0xFF548A50), contentColor = Color.White)
            ) {
                Text("Save")
            }

            Button(onClick = onCancel) {
                Text("Cancel")
            }
        }
    }
}
//--------------------------------------------------------------------------------------------------------------------------------
@Composable
fun CityDataScreen() {
    var viewMode by remember { mutableStateOf("list") }
    var cityList by remember { mutableStateOf<List<MunicipalityData>>(emptyList()) }
    var editIndex by remember { mutableStateOf(-1) }
    var editingCity by remember { mutableStateOf<MunicipalityData?>(null) }
    val coroutineScope = rememberCoroutineScope()

    var selectedFilter by remember { mutableStateOf("All") }
    var sortMode by remember { mutableStateOf("None") }

    ScreenLayout(
        onAddClick = {
            editingCity = null
            editIndex = -1
            viewMode = "form"
        },
        onListClick = { viewMode = "list" },
        onPullClick = {
            viewMode = "list"
            coroutineScope.launch {
                val fetched = withContext(Dispatchers.IO) {
                    fetchAllMunicipalityData()
                }
                cityList = fetched
            }
        },
        onGenerateClick = { viewMode = "generate" },
        onRefreshClick = {
            viewMode = "list"
            coroutineScope.launch {
                val fetched = withContext(Dispatchers.IO) {
                    fetchAllMunicipalityData()
                }
                cityList = fetched
            }
        }
    ) {
        when (viewMode) {
            "list" -> {
                Column(modifier = Modifier.fillMaxSize().padding(8.dp)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("Filter:", fontWeight = FontWeight.Medium)

                        CityFilter(selectedFilter) {
                            selectedFilter = it
                        }

                        SortSelector(sortMode) {
                            sortMode = it
                        }
                    }

                    val filteredList = cityList
                        .filter {
                            selectedFilter == "All" ||
                                    it.name.startsWith(selectedFilter, ignoreCase = true)
                        }
                        .let {
                            when (sortMode) {
                                "A-Z" -> it.sortedBy { it.name }
                                "Z-A" -> it.sortedByDescending { it.name }
                                else -> it
                            }
                        }

                    if (filteredList.isEmpty()) {
                        Text("No data found for selected filter.")
                    } else {
                        LazyColumn(
                            modifier = Modifier
                                .fillMaxSize(),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            itemsIndexed(filteredList) { index, city ->
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    backgroundColor = Color.White,
                                    elevation = 2.dp
                                ) {
                                    Column(modifier = Modifier.padding(12.dp)) {
                                        Text("Občina: ${city.name}", fontWeight = FontWeight.Bold)
                                        Text("Koda: ${city.code}")
                                        Text("Prebivalci: %,d".format(city.value))

                                        Row(
                                            modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                                            horizontalArrangement = Arrangement.End
                                        ) {
                                            Button(
                                                onClick = {
                                                    editingCity = city
                                                    editIndex = index
                                                    viewMode = "form"
                                                },
                                                colors = ButtonDefaults.buttonColors(
                                                    backgroundColor = Color(0xFF3E6E3B),
                                                    contentColor = Color.White
                                                )
                                            ) { Text("Edit") }
                                            Spacer(modifier = Modifier.width(12.dp))
                                            Button(
                                                onClick = {
                                                    cityList = cityList.toMutableList().also { it.remove(city) }
                                                },
                                                colors = ButtonDefaults.buttonColors(
                                                    backgroundColor = Color(0xFFB00020),
                                                    contentColor = Color.White
                                                )
                                            ) { Text("Delete") }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            "form" -> {
                CityAddForm(
                    city = editingCity,
                    onSave = { newCity ->
                        cityList = cityList.toMutableList().also {
                            if (editIndex >= 0) it[editIndex] = newCity else it.add(newCity)
                        }
                        viewMode = "list"
                    },
                    onCancel = { viewMode = "list" }
                )
            }

            "generate" -> {
                GenerateCityDialog(
                    onGenerate = {
                        cityList = cityList + it
                        viewMode = "list"
                    },
                    onDismiss = { viewMode = "list" }
                )
            }
        }
    }
}
@Composable
fun CityFilter(selectedFilter: String, onFilterChange: (String) -> Unit) {
    var expanded by remember { mutableStateOf(false) }
    val filterOptions = listOf(
        "All", "A", "B", "C", "Č", "D", "E", "F", "G", "H",
        "I", "J", "K", "L", "M", "N", "O", "P", "R", "S", "Š",
        "T", "U", "V", "Z", "Ž"
    )

    Box {
        Button(onClick = { expanded = true }) {
            Text("Filter: $selectedFilter")
        }

        DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            filterOptions.forEach { filter ->
                DropdownMenuItem(onClick = {
                    onFilterChange(filter)
                    expanded = false
                }) {
                    Text(filter)
                }
            }
        }
    }
}
@Composable
fun SortSelector(sortMode: String, onSortChange: (String) -> Unit) {
    var expanded by remember { mutableStateOf(false) }

    val options = listOf("None", "A-Z", "Z-A")

    Box {
        Button(onClick = { expanded = true }) {
            Text("Sort: $sortMode")
        }

        DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            options.forEach { mode ->
                DropdownMenuItem(onClick = {
                    onSortChange(mode)
                    expanded = false
                }) {
                    Text(mode)
                }
            }
        }
    }
}
@Composable
fun GenerateCityDialog(
    onGenerate: (List<MunicipalityData>) -> Unit,
    onDismiss: () -> Unit
) {
    var countText by remember { mutableStateOf("10") }
    var yearText by remember { mutableStateOf("2021") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Generate Fake Cities") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                TextField(
                    value = countText,
                    onValueChange = { countText = it },
                    label = { Text("Number of Cities") },
                    singleLine = true
                )
                TextField(
                    value = yearText,
                    onValueChange = { yearText = it },
                    label = { Text("Year") },
                    singleLine = true
                )
            }
        },
        confirmButton = {
            Button(onClick = {
                val count = countText.toIntOrNull() ?: return@Button
                val generated = List(count) { index ->
                    MunicipalityData(
                        code = index.toString().padStart(3, '0'),
                        name = "City $index",
                        year = yearText,
                        value = (5000..1000000).random()
                    )
                }
                onGenerate(generated)
                onDismiss()
            }) {
                Text("Generate")
            }
        },
        dismissButton = {
            Button(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
@Composable
fun CityAddForm(
    city: MunicipalityData?,
    onSave: (MunicipalityData) -> Unit,
    onCancel: () -> Unit
) {
    var code by remember { mutableStateOf(city?.code ?: "") }
    var name by remember { mutableStateOf(city?.name ?: "") }
    var year by remember { mutableStateOf(city?.year ?: "2021") }
    var valueText by remember { mutableStateOf(city?.value?.toString() ?: "") }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFFF6F5EE))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = if (city == null) "Add City" else "Edit City",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold
        )

        TextField(value = code, onValueChange = { code = it }, label = { Text("Code") })
        TextField(value = name, onValueChange = { name = it }, label = { Text("Name") })
        TextField(value = year, onValueChange = { year = it }, label = { Text("Year") })
        TextField(
            value = valueText,
            onValueChange = { valueText = it },
            label = { Text("Population") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
        )

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(
                onClick = {
                    val value = valueText.toIntOrNull()
                    if (value != null) {
                        onSave(MunicipalityData(code = code, name = name, year = year, value = value))
                    }
                },
                colors = ButtonDefaults.buttonColors(backgroundColor = Color(0xFF548A50), contentColor = Color.White)
            ) {
                Text("Save")
            }

            Button(onClick = onCancel) {
                Text("Cancel")
            }
        }
    }
}
//--------------------------------------------------------------------------------------------------------------------------------
@Composable
fun CentersScreen() {
    var viewMode by remember { mutableStateOf("list") }
    var centerList by remember { mutableStateOf<List<CollectionCenter>>(emptyList()) }
    var editIndex by remember { mutableStateOf(-1) }
    var editingCenter by remember { mutableStateOf<CollectionCenter?>(null) }
    val coroutineScope = rememberCoroutineScope()

    var selectedFilter by remember { mutableStateOf("All") }
    var sortMode by remember { mutableStateOf("None") }

    ScreenLayout(
        onAddClick = {
            editingCenter = null
            editIndex = -1
            viewMode = "form"
        },
        onListClick = { viewMode = "list" },
        onPullClick = {
            coroutineScope.launch {
                val fetched = withContext(Dispatchers.IO) {
                    fetchInterzeroCollectionCenters()
                }
                centerList = fetched
                viewMode = "list"
            }
        },
        onGenerateClick = { viewMode = "generate" },
        onRefreshClick = {
            coroutineScope.launch {
                val fetched = withContext(Dispatchers.IO) {
                    fetchInterzeroCollectionCenters()
                }
                centerList = fetched
                viewMode = "list"
            }
        }
    ) {
        when (viewMode) {
            "list" -> {
                Column(modifier = Modifier.fillMaxSize().padding(8.dp)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("Filter:", fontWeight = FontWeight.Medium)

                        CollectionFilter(selectedFilter) {
                            selectedFilter = it
                        }

                        SortSelector(sortMode) {
                            sortMode = it
                        }
                    }

                    val filteredList = centerList
                        .filter {
                            selectedFilter == "All" ||
                                    it.location.startsWith(selectedFilter, ignoreCase = true)
                        }
                        .let {
                            when (sortMode) {
                                "A-Z" -> it.sortedBy { it.location }
                                "Z-A" -> it.sortedByDescending { it.location }
                                else -> it
                            }
                        }

                    if (filteredList.isEmpty()) {
                        Text("No data found for selected filter.")
                    } else {
                        LazyColumn(
                            modifier = Modifier
                                .fillMaxSize(),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            itemsIndexed(filteredList) { index, center ->
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    backgroundColor = Color.White,
                                    elevation = 2.dp
                                ) {
                                    Column(modifier = Modifier.padding(12.dp)) {
                                        Text("Lokacija: ${center.location}", fontWeight = FontWeight.Bold)
                                        Text("Prevzemnik: ${center.receiver}")
                                        Text("Naslov: ${center.address}")
                                        Text("Delovni čas: ${center.workingHours}")

                                        Row(
                                            modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                                            horizontalArrangement = Arrangement.End
                                        ) {
                                            Button(
                                                onClick = {
                                                    editingCenter = center
                                                    editIndex = index
                                                    viewMode = "form"
                                                },
                                                colors = ButtonDefaults.buttonColors(
                                                    backgroundColor = Color(0xFF3E6E3B),
                                                    contentColor = Color.White
                                                )
                                            ) { Text("Edit") }
                                            Spacer(modifier = Modifier.width(12.dp))
                                            Button(
                                                onClick = {
                                                    centerList = centerList.toMutableList().also {
                                                        it.removeAt(index)
                                                    }
                                                },
                                                colors = ButtonDefaults.buttonColors(
                                                    backgroundColor = Color(0xFFB00020),
                                                    contentColor = Color.White
                                                )
                                            ) { Text("Delete") }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            "form" -> {
                CollectionCenterForm(
                    center = editingCenter,
                    onSave = { newCenter ->
                        centerList = centerList.toMutableList().also {
                            if (editIndex >= 0) it[editIndex] = newCenter else it.add(newCenter)
                        }
                        viewMode = "list"
                    },
                    onCancel = { viewMode = "list" }
                )
            }

            "generate" -> {
                GenerateCollectionDialog(
                    onGenerate = {
                        centerList = centerList + it
                        viewMode = "list"
                    },
                    onDismiss = { viewMode = "list" }
                )
            }
        }
    }
}
@Composable
fun CollectionFilter(selectedFilter: String, onFilterChange: (String) -> Unit) {
    var expanded by remember { mutableStateOf(false) }
    val filterOptions = listOf(
        "All", "A", "B", "C", "Č", "D", "E", "F", "G", "H",
        "I", "J", "K", "L", "M", "N", "O", "P", "R", "S", "Š",
        "T", "U", "V", "Z", "Ž"
    )

    Box {
        Button(onClick = { expanded = true }) {
            Text("Filter: $selectedFilter")
        }

        DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            filterOptions.forEach { filter ->
                DropdownMenuItem(onClick = {
                    onFilterChange(filter)
                    expanded = false
                }) {
                    Text(filter)
                }
            }
        }
    }
}
@Composable
fun CollectionCenterForm(
    center: CollectionCenter?,
    onSave: (CollectionCenter) -> Unit,
    onCancel: () -> Unit
) {
    var receiver by remember { mutableStateOf(center?.receiver ?: "") }
    var location by remember { mutableStateOf(center?.location ?: "") }
    var address by remember { mutableStateOf(center?.address ?: "") }
    var workingHours by remember { mutableStateOf(center?.workingHours ?: "") }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFFF6F5EE))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = if (center == null) "Add Collection Center" else "Edit Collection Center",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold
        )

        TextField(value = receiver, onValueChange = { receiver = it }, label = { Text("Receiver") })
        TextField(value = location, onValueChange = { location = it }, label = { Text("Location") })
        TextField(value = address, onValueChange = { address = it }, label = { Text("Address") })
        TextField(value = workingHours, onValueChange = { workingHours = it }, label = { Text("Working Hours") })

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(
                onClick = {
                    onSave(CollectionCenter(receiver, location, address, workingHours))
                },
                colors = ButtonDefaults.buttonColors(backgroundColor = Color(0xFF548A50), contentColor = Color.White)
            ) {
                Text("Save")
            }

            Button(onClick = onCancel) {
                Text("Cancel")
            }
        }
    }
}
@Composable
fun GenerateCollectionDialog(
    onGenerate: (List<CollectionCenter>) -> Unit,
    onDismiss: () -> Unit
) {
    var countText by remember { mutableStateOf("5") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Generate Fake Collection Centers") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                TextField(
                    value = countText,
                    onValueChange = { countText = it },
                    label = { Text("Number of Centers") },
                    singleLine = true
                )
            }
        },
        confirmButton = {
            Button(onClick = {
                val count = countText.toIntOrNull() ?: return@Button
                val generated = List(count) { index ->
                    CollectionCenter(
                        receiver = "Receiver $index",
                        location = "Location $index",
                        address = "Street $index",
                        workingHours = "8:00 - 16:00"
                    )
                }
                onGenerate(generated)
                onDismiss()
            }) {
                Text("Generate")
            }
        },
        dismissButton = {
            Button(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
//--------------------------------------------------------------------------------------------------------------------------------
@Composable
fun ScreenLayout(
    onAddClick: () -> Unit,
    onListClick: () -> Unit,
    onPullClick: () -> Unit,
    onGenerateClick: () -> Unit,
    onRefreshClick: () -> Unit,
    content: @Composable () -> Unit
) {
    Column(modifier = Modifier.fillMaxSize()) {

        Row(modifier = Modifier.fillMaxWidth().background(Color(0xFFF6F5EE)), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = onListClick,
                colors = ButtonDefaults.buttonColors(
                    backgroundColor = Color(0xFF3E6E3B),
                    contentColor = Color.White
                )) {
                Icon(Icons.Default.List, contentDescription = "List")
                Spacer(modifier = Modifier.width(4.dp))
                Text("List")
                }
            Button(onClick = onAddClick,
                colors = ButtonDefaults.buttonColors(
                    backgroundColor = Color(0xFF3E6E3B),
                    contentColor = Color.White
                )){
                Icon(Icons.Default.Add, contentDescription = "Add")
                Spacer(modifier = Modifier.width(4.dp))
                Text("Add")
            }
            Button(onClick = onPullClick,
                colors = ButtonDefaults.buttonColors(
                    backgroundColor = Color(0xFF3E6E3B),
                    contentColor = Color.White
                )){
                Icon(Icons.Default.Share, contentDescription = "Pull")
                Spacer(modifier = Modifier.width(4.dp))
                Text("Scraper")
            }
            Button(onClick = onGenerateClick,
                colors = ButtonDefaults.buttonColors(
                    backgroundColor = Color(0xFF3E6E3B),
                    contentColor = Color.White
                )){
                Icon(Icons.Default.Build, contentDescription = "Generate")
                Spacer(modifier = Modifier.width(4.dp))
                Text("Generate")
            }
            Button(onClick = onRefreshClick,
                colors = ButtonDefaults.buttonColors(
                    backgroundColor = Color(0xFF3E6E3B),
                    contentColor = Color.White
                )){
                Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                Spacer(modifier = Modifier.width(4.dp))
                Text("Refresh")
            }
        }

        Divider(modifier = Modifier.padding(vertical = 8.dp))

        Box(modifier = Modifier.fillMaxSize()) {
            content()
        }
    }
}
@Composable
fun InfoPage() {
    Column(modifier = Modifier.padding(16.dp)) {
        Text("Author: EcoPin")
        Spacer(modifier = Modifier.height(12.dp))
        Text("O projektu", style = MaterialTheme.typography.h5)
        Spacer(modifier = Modifier.height(12.dp))
        Text("Aplikacija za upravljanje s podatki, pred vnosom v podatkovno bazo, ustvarjena v okviru projekta pri predmetu Principi programskih jezikov.")
    }
}
//--------------------------------------------------------------------------------------------------------------------------------
fun main() = application {
    Window(
        title = "EcoPin",
        onCloseRequest = ::exitApplication
    ) {
        App()
    }
}