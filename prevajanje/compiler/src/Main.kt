import java.io.*
import javax.print.attribute.standard.Severity

const val ERROR_STATE = 0

const val EOF_SYMBOL = -1
const val SKIP_SYMBOL = 0

const val NUMBER_SYMBOL = 1
const val STRING_SYMBOL = 2
const val LPAREN_SYMBOL = 3
const val RPAREN_SYMBOL = 4
const val LBRACE_SYMBOL = 5
const val RBRACE_SYMBOL = 6
const val SEMI_SYMBOL = 7
const val COMMA_SYMBOL = 8
const val CITY_SYMBOL = 9
const val ROAD_SYMBOL = 10
const val BUILDING_SYMBOL = 11
const val ECOISLAND_SYMBOL = 12
const val BIN_SYMBOL = 13
const val DISPOSALSITE_SYMBOL = 14
const val REPORT_SYMBOL = 15
const val BOX_SYMBOL = 16
const val LINE_SYMBOL = 17
const val CIRC_SYMBOL = 18
const val BEND_SYMBOL = 19
const val POLYGON_SYMBOL = 20
const val SEVERITY_SYMBOL = 21


const val EOF = -1
const val NEWLINE = '\n'.code

interface DFA {
    val states: Set<Int>
    val alphabet: IntRange
    fun next(state: Int, code: Int): Int
    fun symbol(state: Int): Int
    val startState: Int
    val finalStates: Set<Int>
}

object LanguageAutomaton: DFA {
    override val states = (1 .. 87).toSet() //15
    override val alphabet = 0 .. 65536
    override val startState = 1
    override val finalStates = setOf(2, 4, 6, 10, 12, 16, 21, 29, 31, 33, 36, 46, 59, 63, 70, 78, 79, 80, 81, 82, 83, 84, 85, 86)

    private val numberOfStates = states.max() + 1 // plus the ERROR_STATE
    private val numberOfCodes = alphabet.max() + 1 // plus the EOF
    private val transitions = Array(numberOfStates) {IntArray(numberOfCodes)}
    private val values = Array(numberOfStates) {SKIP_SYMBOL}

    private fun setTransition(from: Int, chr: Char, to: Int) {
        transitions[from][chr.code + 1] = to // + 1 because EOF is -1 and the array starts at 0
    }

    private fun setTransition(from: Int, code: Int, to: Int) {
        transitions[from][code + 1] = to
    }

    private fun setSymbol(state: Int, symbol: Int) {
        values[state] = symbol
    }

    override fun next(state: Int, code: Int): Int {
        assert(states.contains(state))
        assert(alphabet.contains(code))
        return transitions[state][code+1]
    }

    override fun symbol(state: Int): Int {
        assert(states.contains(state))
        return values[state]
    }
    init {

        // NUMBER (decimal in int)

        setTransition(1, '-', 87)
        setTransition(1, '+', 87)

        for (digit in '0'..'9') {
            setTransition(1, digit, 2)
            setTransition(2, digit, 2)
            setTransition(87, digit, 2)
        }
        setTransition(2, '.', 3)
        for (digit in '0'..'9') {
            setTransition(3, digit, 4)
            setTransition(4, digit, 4)
        }
        setSymbol(2, NUMBER_SYMBOL)
        setSymbol(4, NUMBER_SYMBOL)


        //STRING
        setTransition(1, '"', 5)
        for (code in 0..Char.MAX_VALUE.code) {
            if (code != '"'.code && code != '\n'.code && code != '\r'.code) {
                setTransition(5, code.toChar(), 5)
            }
        }
        setTransition(5, '"', 6)
        setSymbol(6, STRING_SYMBOL)


        //CITY
        setTransition(1, 'c', 7)
        setTransition(7, 'i', 8)
        setTransition(8, 't', 9)
        setTransition(9, 'y', 10)
        setSymbol(10, CITY_SYMBOL)
        setTransition(8, 'r', 11)
        setTransition(11, 'c', 12)
        setSymbol(12, CIRC_SYMBOL)

        //ROAD
        setTransition(1, 'r', 13)
        setTransition(13, 'o', 14)
        setTransition(14, 'a', 15)
        setTransition(15, 'd', 16)
        setSymbol(16, ROAD_SYMBOL)
        setTransition(13, 'e', 17)
        setTransition(17, 'p', 18)
        setTransition(18, 'o', 19)
        setTransition(19, 'r', 20)
        setTransition(20, 't', 21)
        setSymbol(21, REPORT_SYMBOL)

        // BUILDING
        setTransition(1, 'b', 22)
        setTransition(22, 'u', 23)
        setTransition(23, 'i', 24)
        setTransition(24, 'l', 25)
        setTransition(25, 'd', 26)
        setTransition(26, 'i', 27)
        setTransition(27, 'n', 28)
        setTransition(28, 'g', 29)
        setSymbol(29, BUILDING_SYMBOL)
        setTransition(22, 'i', 30)
        setTransition(30, 'n', 31)
        setSymbol(31, BIN_SYMBOL)
        setTransition(22, 'o', 32)
        setTransition(32, 'x', 33)
        setSymbol(33, BOX_SYMBOL)
        setTransition(22, 'e', 34)
        setTransition(34, 'n', 35)
        setTransition(35, 'd', 36)
        setSymbol(36, BEND_SYMBOL)

        // ECO-ISLAND
        setTransition(1, 'e', 37)
        setTransition(37, 'c', 38)
        setTransition(38, 'o', 39)
        setTransition(39, '-', 40)
        setTransition(40, 'i', 41)
        setTransition(41, 's', 42)
        setTransition(42, 'l', 43)
        setTransition(43, 'a', 44)
        setTransition(44, 'n', 45)
        setTransition(45, 'd', 46)
        setSymbol(46, ECOISLAND_SYMBOL)

        // DISPOSAL-SITE
        setTransition(1, 'd', 47)
        setTransition(47, 'i', 48)
        setTransition(48, 's', 49)
        setTransition(49, 'p', 50)
        setTransition(50, 'o', 51)
        setTransition(51, 's', 52)
        setTransition(52, 'a', 53)
        setTransition(53, 'l', 54)
        setTransition(54, '-', 55)
        setTransition(55, 's', 56)
        setTransition(56, 'i', 57)
        setTransition(57, 't', 58)
        setTransition(58, 'e', 59)
        setSymbol(59, DISPOSALSITE_SYMBOL)

        // LINE
        setTransition(1, 'l', 60)
        setTransition(60, 'i', 61)
        setTransition(61, 'n', 62)
        setTransition(62, 'e', 63)
        setSymbol(63, LINE_SYMBOL)

        // POLYGON
        setTransition(1, 'p', 64)
        setTransition(64, 'o', 65)
        setTransition(65, 'l', 66)
        setTransition(66, 'y', 67)
        setTransition(67, 'g', 68)
        setTransition(68, 'o', 69)
        setTransition(69, 'n', 70)
        setSymbol(70, POLYGON_SYMBOL)

        // SEVERITY
        setTransition(1, 's', 71)
        setTransition(71, 'e', 72)
        setTransition(72, 'v', 73)
        setTransition(73, 'e', 74)
        setTransition(74, 'r', 75)
        setTransition(75, 'i', 76)
        setTransition(76, 't', 77)
        setTransition(77, 'y', 78)
        setSymbol(78, SEVERITY_SYMBOL)

        //LPAREN, RPAREN, LBRACE, RBRACE, SEMI, COMMA
        setTransition(1, '(', 79)
        setTransition(1, ')', 80)
        setTransition(1, '{', 81)
        setTransition(1, '}', 82)
        setTransition(1, ';', 83)
        setTransition(1, ',', 84)

        //Za WHITESPACE-e in EOF
        setTransition(1, ' ', 85)
        setTransition(1, '\n', 85)
        setTransition(1, '\r', 85)
        setTransition(1, '\t', 85)
        setTransition(1, EOF, 86)

        setSymbol(79, LPAREN_SYMBOL)
        setSymbol(80, RPAREN_SYMBOL)
        setSymbol(81, LBRACE_SYMBOL)
        setSymbol(82, RBRACE_SYMBOL)
        setSymbol(83, SEMI_SYMBOL)
        setSymbol(84, COMMA_SYMBOL)
        setSymbol(85, SKIP_SYMBOL)
        setSymbol(86, EOF_SYMBOL)
    }
}

data class Token(val symbol: Int, val lexeme: String, val startRow: Int, val startColumn: Int)

class Scanner(private val automaton: DFA, private val stream: Reader) {
    private var last: Int? = null
    private var row = 1
    private var column = 1

    private fun updatePosition(code: Int) {
        if (code == NEWLINE) {
            row += 1
            column = 1
        } else {
            column += 1
        }
    }

    fun getToken(): Token {
        val startRow = row
        val startColumn = column
        val buffer = mutableListOf<Char>()

        var code = last ?: stream.read()
        var state = automaton.startState
        while (true) {
            val nextState = automaton.next(state, code)
            if (nextState == ERROR_STATE) break // Longest match

            state = nextState
            updatePosition(code)
            buffer.add(code.toChar())
            code = stream.read()
        }
        last = code // The code following the current lexeme is the first code of the next lexeme

        if (automaton.finalStates.contains(state)) {
            val symbol = automaton.symbol(state)
            return if (symbol == SKIP_SYMBOL) {
                getToken()
            } else {
                val lexeme = String(buffer.toCharArray())
                Token(symbol, lexeme, startRow, startColumn)
            }
        } else {
            throw Exception("Invalid pattern at ${row}:${column}")
        }
    }
}

fun name(symbol: Int) =
    when (symbol) {
        NUMBER_SYMBOL -> "NUM"
        STRING_SYMBOL -> "STRING"
        LPAREN_SYMBOL -> "LPAREN"
        RPAREN_SYMBOL -> "RPAREN"
        LBRACE_SYMBOL -> "LBRACE"
        RBRACE_SYMBOL -> "RBRACE"
        SEMI_SYMBOL -> "SEMI"
        COMMA_SYMBOL -> "COMMA"
        CIRC_SYMBOL -> "CIRC"
        BEND_SYMBOL -> "BEND"
        LINE_SYMBOL -> "LINE"
        ROAD_SYMBOL -> "ROAD"
        CITY_SYMBOL -> "CITY"
        BUILDING_SYMBOL -> "BUILDING"
        BIN_SYMBOL -> "BIN"
        DISPOSALSITE_SYMBOL -> "DISPOSAL-SITE"
        ECOISLAND_SYMBOL -> "ECO-ISLAND"
        BOX_SYMBOL -> "BOX"
        REPORT_SYMBOL -> "REPORT"
        POLYGON_SYMBOL -> "POLYGON"
        SEVERITY_SYMBOL -> "SEVERITY"
        else -> throw Error("Invalid symbol")
    }

fun printTokens(scanner: Scanner) {
    val token = scanner.getToken()
    if (token.symbol != EOF_SYMBOL) {
        print("${name(token.symbol)}(\"${token.lexeme}\") ")
        printTokens(scanner)
    }
}

class Parser(private val scanner: Scanner) {
    private var currentToken: Token = scanner.getToken()

    fun parse(): ProgramNode {
        val cities = mutableListOf<CityNode>()
        while (currentToken.symbol != EOF_SYMBOL) {
            cities.add(element())
        }
        return ProgramNode(cities)
    }

    private fun match(symbol: Int) {
        if (currentToken.symbol == symbol) {
            currentToken = scanner.getToken()
        } else {
            throw Exception("Invalid pattern at ${currentToken.symbol}");
        }
    }

    private fun program() {
        elementList()
    }

    private fun elementList() {
        when (currentToken.symbol) {
            CITY_SYMBOL -> {
                element()
                elementList()
            }
            EOF_SYMBOL -> return
            else -> throw Exception("Syntax error: expected city or EOF, found ${currentToken.symbol}")
        }
    }

    private fun element(): CityNode {
        match(CITY_SYMBOL)
        var name = currentToken.lexeme
        match(STRING_SYMBOL)
        match(LBRACE_SYMBOL)
        val blocks = blockList()
        match(RBRACE_SYMBOL)
        return CityNode(name, blocks)
    }

    private fun blockList(): List<BlockNode> {
        val blocks = mutableListOf<BlockNode>()
        while (
            currentToken.symbol in listOf(
                ROAD_SYMBOL, BUILDING_SYMBOL, ECOISLAND_SYMBOL,
                BIN_SYMBOL, DISPOSALSITE_SYMBOL, REPORT_SYMBOL
            )
        ) {
            blocks.add(block())
        }
        return blocks
    }

    private fun block(): BlockNode {
        return when (currentToken.symbol) {
            ROAD_SYMBOL -> roadBlock()
            BUILDING_SYMBOL -> buildingBlock()
            ECOISLAND_SYMBOL -> poiBlock()
            BIN_SYMBOL -> poiBlock()
            DISPOSALSITE_SYMBOL -> poiBlock()
            REPORT_SYMBOL -> reportBlock()
            else -> throw Exception("Syntax error: expected road, building, eco-island, bin, disposal-site or report, found ${currentToken.lexeme}")
        }
    }

    private fun roadBlock(): RoadBlockNode {
        match(ROAD_SYMBOL)
        val name = currentToken.lexeme
        match(STRING_SYMBOL)
        match(LBRACE_SYMBOL)
        val commandList = commandList()
        match(RBRACE_SYMBOL)
        return RoadBlockNode(name,commandList)
    }

    private fun buildingBlock(): BuildingBlockNode {
        match(BUILDING_SYMBOL)
        val name = currentToken.lexeme
        match(STRING_SYMBOL)
        match(LBRACE_SYMBOL)
        val commandList = commandList()
        match(RBRACE_SYMBOL)
        return BuildingBlockNode(name, commandList)
    }

    private fun poiBlock(): BlockNode {
        return when (currentToken.symbol) {
            ECOISLAND_SYMBOL -> ecoIsland()
            BIN_SYMBOL -> bin()
            DISPOSALSITE_SYMBOL -> disposalSite()
            else -> throw Exception("Syntax error: expected eco-island, bin or disposal-site, found ${currentToken.symbol}")
        }
    }

    private fun ecoIsland(): EcoIslandNode {
        match(ECOISLAND_SYMBOL)
        val name = currentToken.lexeme
        match(STRING_SYMBOL)
        match(LBRACE_SYMBOL)
        match(CIRC_SYMBOL)
        match(LPAREN_SYMBOL)
        val point = point()
        match(COMMA_SYMBOL)
        val radius = currentToken.lexeme.toDouble()
        match(NUMBER_SYMBOL)
        match(RPAREN_SYMBOL)
        match(SEMI_SYMBOL)
        match(RBRACE_SYMBOL)
        return EcoIslandNode(name, point, radius)
    }

    private fun bin(): BinNode {
        match(BIN_SYMBOL)
        val point = point()
        match(SEMI_SYMBOL)
        return BinNode(point)
    }

    private fun disposalSite(): DisposalSiteNode {
        match(DISPOSALSITE_SYMBOL)
        val name = currentToken.lexeme
        match(STRING_SYMBOL)
        match(LBRACE_SYMBOL)
        match(BOX_SYMBOL)
        match(LPAREN_SYMBOL)
        val point1 = point()
        match(COMMA_SYMBOL)
        val point2 = point()
        match(RPAREN_SYMBOL)
        match(SEMI_SYMBOL)
        match(RBRACE_SYMBOL)
        return DisposalSiteNode(name, point1, point2)
    }

    private fun reportBlock(): ReportNode {
        match(REPORT_SYMBOL)
        val name = currentToken.lexeme
        match(STRING_SYMBOL)
        val point = point()

        return if (currentToken.symbol == LBRACE_SYMBOL) {
            match(LBRACE_SYMBOL)
            match(SEVERITY_SYMBOL)
            match(LPAREN_SYMBOL)
            val severity = currentToken.lexeme
            match(STRING_SYMBOL)
            match(RPAREN_SYMBOL)
            match(SEMI_SYMBOL)
            match(RBRACE_SYMBOL)
            ReportNode(name, point, severity)
        } else {
            match(SEMI_SYMBOL)
            ReportNode(name, point)
        }
    }



    private fun commandList(): List<CommandNode> {
        val commands = mutableListOf<CommandNode>()
        while (currentToken.symbol in listOf(LINE_SYMBOL, BEND_SYMBOL, BOX_SYMBOL, CIRC_SYMBOL, POLYGON_SYMBOL)) {
            commands.add(command())
        }
        return commands
    }

    private fun command(): CommandNode {
        return when (currentToken.symbol) {
            LINE_SYMBOL -> {
                match(LINE_SYMBOL)
                match(LPAREN_SYMBOL)
                val point1 = point()
                match(COMMA_SYMBOL)
                val point2 = point()
                match(RPAREN_SYMBOL)
                match(SEMI_SYMBOL)
                LineCommand(point1,point2)
            }
            BEND_SYMBOL -> {
                match(BEND_SYMBOL)
                match(LPAREN_SYMBOL)
                val point1 = point()
                match(COMMA_SYMBOL)
                val point2 = point()
                match(COMMA_SYMBOL)
                val number = currentToken.lexeme.toDouble()
                match(NUMBER_SYMBOL)
                match(RPAREN_SYMBOL)
                match(SEMI_SYMBOL)
                return BendCommand(point1, point2, number)
            }
            BOX_SYMBOL -> {
                match(BOX_SYMBOL)
                match(LPAREN_SYMBOL)
                val point1 = point()
                match(COMMA_SYMBOL)
                val point2 = point()
                match(RPAREN_SYMBOL)
                match(SEMI_SYMBOL)
                return BoxCommand(point1, point2)
            }
            CIRC_SYMBOL -> {
                match(CIRC_SYMBOL)
                match(LPAREN_SYMBOL)
                val point1 = point()
                match(COMMA_SYMBOL)
                val number = currentToken.lexeme.toDouble()
                match(NUMBER_SYMBOL)
                match(RPAREN_SYMBOL)
                match(SEMI_SYMBOL)
                return CircCommand(point1,number)
            }
            POLYGON_SYMBOL -> {
                match(POLYGON_SYMBOL)
                match(LPAREN_SYMBOL)
                val pointList = pointList()
                match(RPAREN_SYMBOL)
                match(SEMI_SYMBOL)
                return PolygonCommand(pointList)
            }
            else -> throw Exception("Syntax error: expected command, found ${currentToken.symbol}")
        }
    }

    private fun pointList(): List<Point> {
        val points = mutableListOf<Point>()
        points.add(point())

        while (currentToken.symbol == COMMA_SYMBOL) {
            match(COMMA_SYMBOL)
            points.add(point())
        }

        return points
    }

    private fun point(): Point {
        match(LPAREN_SYMBOL)
        val number1 = currentToken.lexeme.toDouble()
        match(NUMBER_SYMBOL)
        match(COMMA_SYMBOL)
        val number2 = currentToken.lexeme.toDouble()
        match(NUMBER_SYMBOL)
        match(RPAREN_SYMBOL)
        return Point(number1, number2)
    }
}

sealed class ASTNode

data class ProgramNode(val elements: List<CityNode>) : ASTNode()

data class CityNode(val name: String, val blocks: List<BlockNode>) : ASTNode()

sealed class BlockNode : ASTNode()
data class RoadBlockNode(val name: String, val commands: List<CommandNode>) : BlockNode()
data class BuildingBlockNode(val name: String, val commands: List<CommandNode>) : BlockNode()
data class EcoIslandNode(val name: String, val center: Point, val radius: Double) : BlockNode()
data class BinNode(val location: Point) : BlockNode()
data class DisposalSiteNode(val name: String, val p1: Point, val p2: Point) : BlockNode()
data class ReportNode(val title: String, val location: Point,val severity: String? = null) : BlockNode()

sealed class CommandNode : ASTNode()
data class LineCommand(val from: Point, val to: Point) : CommandNode()
data class BendCommand(val from: Point, val to: Point, val angle: Double) : CommandNode()
data class BoxCommand(val p1: Point, val p2: Point) : CommandNode()
data class CircCommand(val center: Point, val radius: Double) : CommandNode()
data class PolygonCommand(val points: List<Point>) : CommandNode()

data class Point(val x: Double, val y: Double)

fun ASTNode.toGeoJson(): String {
    val features = mutableListOf<String>()

    when (this) {
        is ProgramNode -> {
            for (city in elements) {
                features += city.toGeoJsonFeatures()
            }
        }
        else -> error("Top-level node must be ProgramNode")
    }

    return """
        {
          "type": "FeatureCollection",
          "features": [
            ${features.joinToString(",\n")}
          ]
        }
    """.trimIndent()
}

fun CityNode.toGeoJsonFeatures(): List<String> {
    val result = mutableListOf<String>()
    for (block in blocks) {
        result += block.toGeoJsonFeatures(name)
    }
    return result
}

fun BlockNode.toGeoJsonFeatures(cityName: String): List<String> = when (this) {
    is RoadBlockNode -> commands.map { it.toFeature("road", name) }
    is BuildingBlockNode -> commands.map { it.toFeature("building", name) }
    is EcoIslandNode -> listOf(toFeature("eco-island", name))
    is BinNode -> listOf(toFeature("bin"))
    is DisposalSiteNode -> listOf(toFeature("disposal-site", name))
    is ReportNode -> listOf(toFeature("report"))
}

fun CommandNode.toFeature(type: String, name: String): String = when (this) {
    is LineCommand -> this.toFeature(type, name)
    is BendCommand -> this.toFeature(type, name)
    is BoxCommand -> this.toFeature(type, name)
    is CircCommand -> this.toFeature(type, name)
    is PolygonCommand -> this.toFeature(type, name)
}

fun LineCommand.toFeature(type: String, name: String): String = """
    {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [ [${from.y}, ${from.x}], [${to.y}, ${to.x}] ]
      },
      "properties": { 
        "type": "$type", 
        "name": $name 
      }
    }
""".trimIndent()

fun BendCommand.toFeature(type: String, name: String): String {
    val steps = 20

    val points = interpolateArc(from, to, angle, steps)
    val coordList = points.joinToString(", ") { "[${it.y}, ${it.x}]" }

    return """
        {
          "type": "Feature",
          "geometry": {
            "type": "LineString",
            "coordinates": [ $coordList ]
          },
          "properties": {
            "type": "$type",
            "name": $name,
            "angle": $angle
          }
        }
    """.trimIndent()
}

fun interpolateArc(from: Point, to: Point, angle: Double, steps: Int): List<Point> {
    val points = mutableListOf<Point>()

    val midX = (from.x + to.x) / 2
    val midY = (from.y + to.y) / 2

    val dx = to.x - from.x
    val dy = to.y - from.y
    val length = Math.hypot(dx, dy)
    val radius = length / (2 * Math.sin(Math.toRadians(angle / 2)))

    val normalX = -dy / length
    val normalY = dx / length

    val height = radius * (1 - Math.cos(Math.toRadians(angle / 2)))

    val centerX = midX + normalX * height
    val centerY = midY + normalY * height

    for (i in 0..steps) {
        val t = i.toDouble() / steps
        val x = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * centerX + t * t * to.x
        val y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * centerY + t * t * to.y
        points.add(Point(x, y))
    }

    return points
}

fun BoxCommand.toFeature(type: String, name: String): String = run {
    val (lat1, lon1) = p1
    val (lat2, lon2) = p2
    val coords = listOf(
        "[${lon1}, ${lat1}]",
        "[${lon2}, ${lat1}]",
        "[${lon2}, ${lat2}]",
        "[${lon1}, ${lat2}]",
        "[${lon1}, ${lat1}]"
    ).joinToString(", ")
    """
        {
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": [ [ $coords ] ]
          },
          "properties": { 
            "type": "$type",
            "name": $name }
        }
    """.trimIndent()
}

fun PolygonCommand.toFeature(type: String, name: String): String {
    val coords = points.map { point ->
        "[${point.y}, ${point.x}]"
    } + "[${points[0].y}, ${points[0].x}]"

    return """
        {
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": [ [ ${coords.joinToString(", ")} ] ]
          },
          "properties": { 
            "type": "$type",
            "name": $name 
          }
        }
    """.trimIndent()
}


fun CircCommand.toFeature(type: String, name: String): String {
    val segments = 32
    val angleStep = 2 * Math.PI / segments
    val coords = (0..segments).map { i ->
        val angle = i * angleStep
        val dx = (radius/10000) * Math.cos(angle)
        val dy = (radius/10000) * Math.sin(angle)
        "[${center.y + dx}, ${center.x + dy}]"
    }

    return """
        {
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": [ [ ${coords.joinToString(", ")} ] ]
          },
          "properties": { "type": "$type", "name": $name }
        }
    """.trimIndent()
}


fun EcoIslandNode.toFeature(type: String, name: String): String = CircCommand(center, radius).toFeature(type, name)
fun BinNode.toFeature(type: String): String = """
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [ ${location.y}, ${location.x} ]
      },
      "properties": { "type": "$type" }
    }
""".trimIndent()

fun DisposalSiteNode.toFeature(type: String, name: String): String = BoxCommand(p1, p2).toFeature(type, name)
fun ReportNode.toFeature(type: String): String {
    val color = when (severity?.removeSurrounding("\"")?.lowercase()) {
        "high" -> "#ff0000"
        "medium" -> "#ffa500"
        "low" -> "#ffff00"
        else -> "#ffff00"
    }


    return """
        {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [ ${location.y}, ${location.x} ]
          },
          "properties": {
            "type": "$type",
            "title": $title,
            "severity": ${severity ?: "\"low\""},
            "marker-color": "$color"
          }
        }
    """.trimIndent()
}


fun main(args: Array<String>) {
    try{
        var input = InputStreamReader(FileInputStream("src/test.eco"), Charsets.UTF_8)
        var scanner = Scanner(LanguageAutomaton, input)

        printTokens(scanner);
        println();

        input = InputStreamReader(FileInputStream("src/test.eco"), Charsets.UTF_8)
        scanner = Scanner(LanguageAutomaton, input)
        val parser = Parser(scanner);
        val ast = parser.parse()
        File("output.geojson").writeText(ast.toGeoJson())
        println("accept")
    }catch (e:Exception){
        println("reject")
    }
}
