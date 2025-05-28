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
    override val states = (1 .. 77).toSet() //15
    override val alphabet = 0 .. 255
    override val startState = 1
    override val finalStates = setOf(2, 4, 6, 10, 14, 22, 32, 35, 48, 54, 58, 61, 65, 69, 70, 71, 72, 73, 74, 75, 76, 77)

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
        setTransition(17, 'p', 19)
        setTransition(18, 'o', 20)
        setTransition(19, 'r', 21)
        setTransition(29, 't', 22)
        setSymbol(22, REPORT_SYMBOL)

        // BUILDING
        setTransition(1, 'b', 24)
        setTransition(24, 'u', 25)
        setTransition(25, 'i', 26)
        setTransition(26, 'l', 27)
        setTransition(27, 'd', 28)
        setTransition(28, 'i', 29)
        setTransition(29, 'n', 30)
        setTransition(30, 'g', 31)
        setSymbol(31, BUILDING_SYMBOL)
        setTransition(24, 'i', 32)
        setTransition(32, 'n', 33)
        setSymbol(33, BIN_SYMBOL)
        setTransition(24, 'o', 34)
        setTransition(34, 'x', 35)
        setSymbol(35, BOX_SYMBOL)
        setTransition(24, 'e', 36)
        setTransition(36, 'n', 36)
        setTransition(100, 'd', 69)
        setSymbol(69, BEND_SYMBOL)

        // ECO-ISLAND
        setTransition(1, 'e', 23)
        setTransition(23, 'c', 24)
        setTransition(24, 'o', 25)
        setTransition(25, '-', 26)
        setTransition(26, 'i', 27)
        setTransition(27, 's', 28)
        setTransition(28, 'l', 29)
        setTransition(29, 'a', 30)
        setTransition(30, 'n', 31)
        setTransition(31, 'd', 32)
        setSymbol(32, ECOISLAND_SYMBOL)

        // BIN
        setTransition(1, 'b', 33)
        setTransition(33, 'i', 34)
        setTransition(34, 'n', 35)
        setSymbol(35, BIN_SYMBOL)

        // DISPOSAL-SITE
        setTransition(1, 'd', 36)
        setTransition(36, 'i', 37)
        setTransition(37, 's', 38)
        setTransition(38, 'p', 39)
        setTransition(39, 'o', 40)
        setTransition(40, 's', 41)
        setTransition(41, 'a', 42)
        setTransition(42, 'l', 43)
        setTransition(43, '-', 44)
        setTransition(44, 's', 45)
        setTransition(45, 'i', 46)
        setTransition(46, 't', 47)
        setTransition(47, 'e', 48)
        setSymbol(48, DISPOSALSITE_SYMBOL)

        // REPORT
        setTransition(1, 'r', 49)
        setTransition(49, 'e', 50)
        setTransition(50, 'p', 51)
        setTransition(51, 'o', 52)
        setTransition(52, 'r', 53)
        setTransition(53, 't', 54)
        setSymbol(54, REPORT_SYMBOL)

        // LINE
        setTransition(1, 'l', 55)
        setTransition(55, 'i', 56)
        setTransition(56, 'n', 57)
        setTransition(57, 'e', 58)
        setSymbol(58, LINE_SYMBOL)


        // BOX
        setTransition(1, 'b', 59)
        setTransition(59, 'o', 60)
        setTransition(60, 'x', 61)
        setSymbol(61, BOX_SYMBOL)

        // CIRC
        setTransition(1, 'c', 62)
        setTransition(62, 'i', 63)
        setTransition(63, 'r', 64)
        setTransition(64, 'c', 65)
        setSymbol(65, CIRC_SYMBOL)

        // BEND
        setTransition(1, 'b', 66)
        setTransition(66, 'e', 67)
        setTransition(67, 'n', 68)
        setTransition(68, 'd', 69)
        setSymbol(69, BEND_SYMBOL)


        //LPAREN, RPAREN, LBRACE, RBRACE, SEMI, COMMA
        setTransition(1, '(', 70)
        setTransition(1, ')', 71)
        setTransition(1, '{', 72)
        setTransition(1, '}', 73)
        setTransition(1, ';', 74)
        setTransition(1, ',', 75)

        //Za WHITESPACE-e in EOF
        setTransition(1, ' ', 76)
        setTransition(1, '\n', 76)
        setTransition(1, '\r', 76)
        setTransition(1, '\t', 76)
        setTransition(1, EOF, 77)

        setSymbol(70, LPAREN_SYMBOL)
        setSymbol(71, RPAREN_SYMBOL)
        setSymbol(72, LBRACE_SYMBOL)
        setSymbol(73, RBRACE_SYMBOL)
        setSymbol(74, SEMI_SYMBOL)
        setSymbol(75, COMMA_SYMBOL)
        setSymbol(76, SKIP_SYMBOL)
        setSymbol(77, EOF_SYMBOL)
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

fun main(args: Array<String>) {


    try{
        val input = FileInputStream("src/test.txt")
        printTokens(Scanner(LanguageAutomaton,input))
    }catch(e: Exception){
        println(e.message)
    }




}
