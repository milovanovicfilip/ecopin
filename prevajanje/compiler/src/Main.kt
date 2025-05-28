import java.io.FileInputStream
import java.io.InputStream

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
    override val states = (1 .. 71).toSet() //15
    override val alphabet = 0 .. 255
    override val startState = 1
    override val finalStates = setOf(2, 4, 6, 10, 12, 16, 21, 29, 31, 33, 36, 46, 59, 63, 64, 65, 66, 67, 68, 69, 70, 71)

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
        for (digit in '0'..'9') {
            setTransition(1, digit, 2)
            setTransition(2, digit, 2)
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
        for (code in 32..128) {
            if (code != '"'.code) {
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

        //LPAREN, RPAREN, LBRACE, RBRACE, SEMI, COMMA
        setTransition(1, '(', 64)
        setTransition(1, ')', 65)
        setTransition(1, '{', 66)
        setTransition(1, '}', 67)
        setTransition(1, ';', 68)
        setTransition(1, ',', 69)

        //Za WHITESPACE-e in EOF
        setTransition(1, ' ', 70)
        setTransition(1, '\n', 70)
        setTransition(1, '\r', 70)
        setTransition(1, '\t', 70)
        setTransition(1, EOF, 71)

        setSymbol(64, LPAREN_SYMBOL)
        setSymbol(65, RPAREN_SYMBOL)
        setSymbol(66, LBRACE_SYMBOL)
        setSymbol(67, RBRACE_SYMBOL)
        setSymbol(68, SEMI_SYMBOL)
        setSymbol(69, COMMA_SYMBOL)
        setSymbol(70, SKIP_SYMBOL)
        setSymbol(71, EOF_SYMBOL)
    }
}

data class Token(val symbol: Int, val lexeme: String, val startRow: Int, val startColumn: Int)

class Scanner(private val automaton: DFA, private val stream: InputStream) {
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
            throw Error("Invalid pattern at ${row}:${column}")
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

    fun parse(): Boolean {
        program()
        return currentToken.symbol == EOF_SYMBOL
    }

    private fun match(symbol: Int) {
        if (currentToken.symbol == symbol) {
            currentToken = scanner.getToken()
        } else {
            throw Error("Invalid pattern at ${currentToken.symbol}");
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
            else -> throw Error("Syntax error: expected city or EOF, found ${currentToken.symbol}")
        }
    }

    private fun element() {
        match(CITY_SYMBOL)
        match(STRING_SYMBOL)
        match(LBRACE_SYMBOL)
        blockList()
        match(RBRACE_SYMBOL)
    }

    private fun blockList() {
        when (currentToken.symbol) {
            ROAD_SYMBOL, BUILDING_SYMBOL, ECOISLAND_SYMBOL, BIN_SYMBOL, DISPOSALSITE_SYMBOL, REPORT_SYMBOL -> {
                block()
                blockList()
            }
            RBRACE_SYMBOL -> return
            else -> throw Error("Syntax error: expected road, building, eco-island, bin, disposal-site or report, found ${currentToken.lexeme}")
        }
    }

    private fun block() {
        when (currentToken.symbol) {
            ROAD_SYMBOL -> roadBlock()
            BUILDING_SYMBOL -> buildingBlock()
            ECOISLAND_SYMBOL -> poiBlock()
            BIN_SYMBOL -> poiBlock()
            DISPOSALSITE_SYMBOL -> poiBlock()
            REPORT_SYMBOL -> reportBlock()
            else -> throw Error("Syntax error: expected road, building, eco-island, bin, disposal-site or report, found ${currentToken.symbol}")
        }
    }

    private fun roadBlock() {
        match(ROAD_SYMBOL)
        match(STRING_SYMBOL)
        match(LBRACE_SYMBOL)
        commandList()
        match(RBRACE_SYMBOL)
    }

    private fun buildingBlock() {
        match(BUILDING_SYMBOL)
        match(STRING_SYMBOL)
        match(LBRACE_SYMBOL)
        commandList()
        match(RBRACE_SYMBOL)
    }

    private fun poiBlock() {
        when (currentToken.symbol) {
            ECOISLAND_SYMBOL -> ecoIsland()
            BIN_SYMBOL -> bin()
            DISPOSALSITE_SYMBOL -> disposalSite()
            else -> throw Error("Syntax error: expected eco-island, bin or disposal-site, found ${currentToken.symbol}")
        }
    }

    private fun ecoIsland() {
        match(ECOISLAND_SYMBOL)
        match(STRING_SYMBOL)
        match(LBRACE_SYMBOL)
        match(CIRC_SYMBOL)
        match(LPAREN_SYMBOL)
        point()
        match(COMMA_SYMBOL)
        match(NUMBER_SYMBOL)
        match(RPAREN_SYMBOL)
        match(SEMI_SYMBOL)
        match(RBRACE_SYMBOL)
    }

    private fun bin() {
        match(BIN_SYMBOL)
        point()
        match(SEMI_SYMBOL)
    }

    private fun disposalSite() {
        match(DISPOSALSITE_SYMBOL)
        match(STRING_SYMBOL)
        match(LBRACE_SYMBOL)
        match(BOX_SYMBOL)
        match(LPAREN_SYMBOL)
        point()
        match(COMMA_SYMBOL)
        point()
        match(RPAREN_SYMBOL)
        match(SEMI_SYMBOL)
        match(RBRACE_SYMBOL)
    }

    private fun reportBlock() {
        match(REPORT_SYMBOL)
        point()
        match(SEMI_SYMBOL)
    }

    private fun commandList() {
        when (currentToken.symbol) {
            LINE_SYMBOL, BEND_SYMBOL, BOX_SYMBOL, CIRC_SYMBOL -> {
                command()
                commandList()
            }
            RBRACE_SYMBOL -> return
            else -> throw Error("Syntax error: expected command, found ${currentToken.lexeme}")
        }
    }

    private fun command() {
        when (currentToken.symbol) {
            LINE_SYMBOL -> {
                match(LINE_SYMBOL)
                match(LPAREN_SYMBOL)
                point()
                match(COMMA_SYMBOL)
                point()
                match(RPAREN_SYMBOL)
                match(SEMI_SYMBOL)
            }
            BEND_SYMBOL -> {
                match(BEND_SYMBOL)
                match(LPAREN_SYMBOL)
                point()
                match(COMMA_SYMBOL)
                point()
                match(COMMA_SYMBOL)
                match(NUMBER_SYMBOL)
                match(RPAREN_SYMBOL)
                match(SEMI_SYMBOL)
            }
            BOX_SYMBOL -> {
                match(BOX_SYMBOL)
                match(LPAREN_SYMBOL)
                point()
                match(COMMA_SYMBOL)
                point()
                match(RPAREN_SYMBOL)
                match(SEMI_SYMBOL)
            }
            CIRC_SYMBOL -> {
                match(CIRC_SYMBOL)
                match(LPAREN_SYMBOL)
                point()
                match(COMMA_SYMBOL)
                match(NUMBER_SYMBOL)
                match(RPAREN_SYMBOL)
                match(SEMI_SYMBOL)
            }
            else -> throw Error("Syntax error: expected command, found ${currentToken.symbol}")
        }
    }

    private fun point() {
        match(LPAREN_SYMBOL)
        match(NUMBER_SYMBOL)
        match(COMMA_SYMBOL)
        match(NUMBER_SYMBOL)
        match(RPAREN_SYMBOL)
    }
}


fun main(args: Array<String>) {
    try{
        var input = FileInputStream("src/test.txt")
        var scanner = Scanner(LanguageAutomaton, input)

        printTokens(scanner);
        println();

        input = FileInputStream("src/test.txt")
        scanner = Scanner(LanguageAutomaton, input)
        val parser = Parser(scanner);
        if (parser.parse()) {
            println("accept")
        } else {
            println("reject")
        }
    }catch (e:Exception){
        println("reject")
    }
}
