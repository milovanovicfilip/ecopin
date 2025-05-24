import java.io.FileInputStream
import java.io.InputStream

// Token symbols
const val ERROR_STATE = 0
const val EOF_SYMBOL = -1
const val SKIP_SYMBOL = 0
const val NUMBER_SYMBOL = 1
const val STRING_SYMBOL = 2
const val IDENTIFIER_SYMBOL = 3
const val EQUAL_SYMBOL = 4
const val SEMI_SYMBOL = 5
const val COMMA_SYMBOL = 6
const val LPAREN_SYMBOL = 7
const val RPAREN_SYMBOL = 8
const val LBRACE_SYMBOL = 9
const val RBRACE_SYMBOL = 10
const val LT_SYMBOL = 11
const val GT_SYMBOL = 12
const val PLUS_SYMBOL = 13
const val MINUS_SYMBOL = 14
const val TIMES_SYMBOL = 15
const val DIVIDE_SYMBOL = 16

// Keywords
const val VAR_SYMBOL = 20
const val ARRAY_SYMBOL = 21
const val FUNCTION_SYMBOL = 22
const val CITY_SYMBOL = 23
const val POI_SYMBOL = 24
const val REPORT_SYMBOL = 25
const val GROUP_SYMBOL = 26
const val EVENT_SYMBOL = 27
const val USER_SYMBOL = 28
const val PHOTO_SYMBOL = 29
const val NOTE_SYMBOL = 30
const val SPONSOR_SYMBOL = 31
const val UTILITY_SYMBOL = 32
const val LOCATION_SYMBOL = 33
const val TYPE_SYMBOL = 34
const val TIME_SYMBOL = 35
const val AUTHORITY_SYMBOL = 36
const val IF_SYMBOL = 37
const val FOR_SYMBOL = 38
const val TO_SYMBOL = 39

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

object LanguageAutomaton : DFA {
    override val states = (1..22).toSet()
    override val alphabet = 0..255
    override val startState = 1
    override val finalStates = setOf(2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21)

    private val numberOfStates = states.max() + 1
    private val numberOfCodes = alphabet.max() + 1
    private val transitions = Array(numberOfStates) { IntArray(numberOfCodes) }
    private val values = Array(numberOfStates) { SKIP_SYMBOL }

    private fun setTransition(from: Int, chr: Char, to: Int) {
        transitions[from][chr.code + 1] = to
    }

    private fun setTransition(from: Int, code: Int, to: Int) {
        transitions[from][code + 1] = to
    }

    private fun setSymbol(state: Int, symbol: Int) {
        values[state] = symbol
    }

    override fun next(state: Int, code: Int): Int {
        return transitions[state][code + 1]
    }

    override fun symbol(state: Int): Int {
        return values[state]
    }

    init {
        for (c in '0'..'9') {
            setTransition(1, c, 2)
            setTransition(2, c, 2)
        }
        setTransition(2, '.', 21)
        for (c in '0'..'9') {
            setTransition(21, c, 21)
        }
        setSymbol(2, NUMBER_SYMBOL)
        setSymbol(21, NUMBER_SYMBOL)

        setTransition(1, '"', 3)
        for (c in 32..126) {
            if (c.toChar() != '"') setTransition(3, c.toChar(), 3)
        }
        setTransition(3, '"', 4)
        setSymbol(4, STRING_SYMBOL)

        for (c in 'a'..'z') {
            setTransition(1, c, 5)
            setTransition(5, c, 5)
        }
        for (c in 'A'..'Z') {
            setTransition(1, c, 5)
            setTransition(5, c, 5)
        }
        for (c in '0'..'9') {
            setTransition(5, c, 5)
        }
        setTransition(1, '_', 5)
        setTransition(5, '_', 5)
        setSymbol(5, IDENTIFIER_SYMBOL)

        // Symbols
        setTransition(1, '=', 6); setSymbol(6, EQUAL_SYMBOL)
        setTransition(1, ';', 7); setSymbol(7, SEMI_SYMBOL)
        setTransition(1, ',', 8); setSymbol(8, COMMA_SYMBOL)
        setTransition(1, '(', 9); setSymbol(9, LPAREN_SYMBOL)
        setTransition(1, ')', 10); setSymbol(10, RPAREN_SYMBOL)
        setTransition(1, '{', 11); setSymbol(11, LBRACE_SYMBOL)
        setTransition(1, '}', 12); setSymbol(12, RBRACE_SYMBOL)
        setTransition(1, '<', 13); setSymbol(13, LT_SYMBOL)
        setTransition(1, '>', 14); setSymbol(14, GT_SYMBOL)
        setTransition(1, '+', 15); setSymbol(15, PLUS_SYMBOL)
        setTransition(1, '-', 16); setSymbol(16, MINUS_SYMBOL)
        setTransition(1, '*', 17); setSymbol(17, TIMES_SYMBOL)
        setTransition(1, '/', 18); setSymbol(18, DIVIDE_SYMBOL)

        setTransition(1, ' ', 19); setTransition(1, '\t', 19); setTransition(1, '\n', 19); setSymbol(19, SKIP_SYMBOL)
        setTransition(1, EOF, 20)
        setSymbol(20, EOF_SYMBOL)
    }
}

val keywords = mapOf(
    "var" to VAR_SYMBOL,
    "array" to ARRAY_SYMBOL,
    "function" to FUNCTION_SYMBOL,
    "city" to CITY_SYMBOL,
    "poi" to POI_SYMBOL,
    "report" to REPORT_SYMBOL,
    "group" to GROUP_SYMBOL,
    "event" to EVENT_SYMBOL,
    "user" to USER_SYMBOL,
    "photo" to PHOTO_SYMBOL,
    "note" to NOTE_SYMBOL,
    "sponsor" to SPONSOR_SYMBOL,
    "utility" to UTILITY_SYMBOL,
    "location" to LOCATION_SYMBOL,
    "type" to TYPE_SYMBOL,
    "time" to TIME_SYMBOL,
    "authority" to AUTHORITY_SYMBOL,
    "if" to IF_SYMBOL,
    "for" to FOR_SYMBOL,
    "to" to TO_SYMBOL
)

data class Token(val symbol: Int, val lexeme: String, val row: Int, val column: Int)

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
            if (nextState == ERROR_STATE) break
            state = nextState
            updatePosition(code)
            buffer.add(code.toChar())
            code = stream.read()
        }
        last = code

        if (automaton.finalStates.contains(state)) {
            val lexeme = String(buffer.toCharArray())
            val symbol = when (val baseSymbol = automaton.symbol(state)) {
                IDENTIFIER_SYMBOL -> keywords[lexeme] ?: IDENTIFIER_SYMBOL
                else -> baseSymbol
            }
            return if (symbol == SKIP_SYMBOL) getToken()
            else Token(symbol, lexeme, startRow, startColumn)
        } else {
            throw Error("Invalid pattern at $row:$column")
        }
    }
}

fun name(symbol: Int): String = when (symbol) {
    NUMBER_SYMBOL -> "NUMBER"
    STRING_SYMBOL -> "STRING"
    IDENTIFIER_SYMBOL -> "IDENTIFIER"
    EQUAL_SYMBOL -> "="
    SEMI_SYMBOL -> ";"
    COMMA_SYMBOL -> ","
    LPAREN_SYMBOL -> "("
    RPAREN_SYMBOL -> ")"
    LBRACE_SYMBOL -> "{"
    RBRACE_SYMBOL -> "}"
    LT_SYMBOL -> "<"
    GT_SYMBOL -> ">"
    PLUS_SYMBOL -> "+"
    MINUS_SYMBOL -> "-"
    TIMES_SYMBOL -> "*"
    DIVIDE_SYMBOL -> "/"
    VAR_SYMBOL -> "var"
    ARRAY_SYMBOL -> "array"
    FUNCTION_SYMBOL -> "function"
    CITY_SYMBOL -> "city"
    POI_SYMBOL -> "poi"
    REPORT_SYMBOL -> "report"
    GROUP_SYMBOL -> "group"
    EVENT_SYMBOL -> "event"
    USER_SYMBOL -> "user"
    PHOTO_SYMBOL -> "photo"
    NOTE_SYMBOL -> "note"
    SPONSOR_SYMBOL -> "sponsor"
    UTILITY_SYMBOL -> "utility"
    LOCATION_SYMBOL -> "location"
    TYPE_SYMBOL -> "type"
    TIME_SYMBOL -> "time"
    AUTHORITY_SYMBOL -> "authority"
    IF_SYMBOL -> "if"
    FOR_SYMBOL -> "for"
    TO_SYMBOL -> "to"
    else -> "UNKNOWN"
}

fun printTokens(scanner: Scanner) {
    val token = scanner.getToken()
    if (token.symbol != EOF_SYMBOL) {
        println("${name(token.symbol)} (\"${token.lexeme}\") at ${token.row}:${token.column}")
        printTokens(scanner)
    }
}

fun main() {
    val input = FileInputStream("src/test.txt")
    printTokens(Scanner(LanguageAutomaton, input))
}
