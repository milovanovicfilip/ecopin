import jdk.jfr.internal.EventWriterKey.block
import java.io.FileInputStream
import java.io.InputStream
import kotlin.math.exp

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
const val IN_SYMBOL = 40
const val LBRACKET_SYMBOL = 41
const val RBRACKET_SYMBOL = 42
const val COORDS_SYMBOL = 43
const val CALL_SYMBOL = 44

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
    override val states = (1..24).toSet()
    override val alphabet = 0..255
    override val startState = 1
    override val finalStates = setOf(2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23)

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

        //NUMBER
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

        //STRING
        setTransition(1, '"', 3)
        for (c in 32..126) {
            if (c.toChar() != '"')
                setTransition(3, c.toChar(), 3)
        }
        setTransition(3, '"', 4)
        setSymbol(4, STRING_SYMBOL)

        //IDENTIFIER
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
        setTransition(1, '[', 22); setSymbol(22, LBRACKET_SYMBOL)
        setTransition(1, ']', 23); setSymbol(23, RBRACKET_SYMBOL)

        setTransition(1, ' ', 19); setTransition(1, '\t', 19); setTransition(1, '\n', 19); setSymbol(19, SKIP_SYMBOL)
        setTransition(1, EOF, 20)
        setSymbol(20, EOF_SYMBOL)
    }
}

val keywords = mapOf(
    "var" to VAR_SYMBOL,
    "coordinates" to COORDS_SYMBOL,
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
    "to" to TO_SYMBOL,
    "in" to IN_SYMBOL, // IN
    "call" to CALL_SYMBOL
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
    EQUAL_SYMBOL -> "equal"
    SEMI_SYMBOL -> "semicolon"
    COMMA_SYMBOL -> "comma"
    LPAREN_SYMBOL -> "lparen"
    RPAREN_SYMBOL -> "rparen"
    LBRACE_SYMBOL -> "lbrace"
    RBRACE_SYMBOL -> "rbrace"
    LT_SYMBOL -> "lt"
    GT_SYMBOL -> "gt"
    PLUS_SYMBOL -> "plus"
    MINUS_SYMBOL -> "minus"
    TIMES_SYMBOL -> "times"
    DIVIDE_SYMBOL -> "divide"
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
    IN_SYMBOL -> "in" // IN
    LBRACKET_SYMBOL -> "lbracket"
    RBRACKET_SYMBOL -> "rbracket"
    COORDS_SYMBOL -> "coordinates"
    CALL_SYMBOL -> "call"
    else -> "UNKNOWN"
}

fun printTokens(scanner: Scanner) {
    val token = scanner.getToken()
    if (token.symbol != EOF_SYMBOL) {
        println("${name(token.symbol)} (\"${token.lexeme}\") at ${token.row}:${token.column}")
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
            throw Exception("Invalid syntax at ${currentToken.row}:${currentToken.column}. Expected ${name(symbol)}, found ${name(currentToken.symbol)}")
        }
    }

    private fun program() {
        statementList()
    }

    private fun statementList() {
        when (currentToken.symbol) {
            EOF_SYMBOL -> return
            else -> {
                statement()
                statementList()
            }
        }
    }

    private fun statement() {
        when (currentToken.symbol) {
            VAR_SYMBOL -> variableDeclaration()
            ARRAY_SYMBOL -> arrayDeclaration()
            FUNCTION_SYMBOL -> functionDefinition()
            CALL_SYMBOL -> functionCall()
            CITY_SYMBOL -> cityBlock()
            FOR_SYMBOL -> forLoop()
            IF_SYMBOL -> ifStatement()
            else -> throw Exception("Invalid statement start at ${currentToken.row}:${currentToken.column}. Found '${name(currentToken.symbol)}'")
        }
    }

    private fun variableDeclaration() {
        match(VAR_SYMBOL)
        match(IDENTIFIER_SYMBOL)
        match(EQUAL_SYMBOL)
        expression()
        match(SEMI_SYMBOL)
    }

    private fun arrayDeclaration() {
        match(ARRAY_SYMBOL)
        match(IDENTIFIER_SYMBOL)
        match(LT_SYMBOL)
        type()
        match(GT_SYMBOL)
        match(LBRACKET_SYMBOL)
        expressionList()
        match(RBRACKET_SYMBOL)
        match(SEMI_SYMBOL)
    }

    private fun type() {
        when (currentToken.symbol) {
            POI_SYMBOL, USER_SYMBOL, STRING_SYMBOL, NUMBER_SYMBOL -> match(currentToken.symbol)
            else -> throw Exception("Invalid syntax at ${currentToken.row}:${currentToken.column}. Expected type, found ${name(currentToken.symbol)}")
        }
    }

    private fun expression() {
        term()
        expressionTail()
    }

    private fun expressionTail() {
        when (currentToken.symbol) {
            PLUS_SYMBOL, MINUS_SYMBOL, TIMES_SYMBOL, DIVIDE_SYMBOL -> {
                operator()
                term()
                expressionTail()
            }
        }
    }

    private fun term() {
        when (currentToken.symbol) {
            NUMBER_SYMBOL -> match(NUMBER_SYMBOL)
            STRING_SYMBOL -> match(STRING_SYMBOL)
            IDENTIFIER_SYMBOL -> match(IDENTIFIER_SYMBOL)
            COORDS_SYMBOL -> coordinates()
            LPAREN_SYMBOL -> {
                match(LPAREN_SYMBOL)
                expression()
                match(RPAREN_SYMBOL)
            }
            POI_SYMBOL, REPORT_SYMBOL, GROUP_SYMBOL, EVENT_SYMBOL -> block()
            else -> throw Exception("Invalid term at ${currentToken.row}:${currentToken.column}")
        }
    }

    private fun operator() {
        when (currentToken.symbol) {
            PLUS_SYMBOL -> match(PLUS_SYMBOL)
            MINUS_SYMBOL -> match(MINUS_SYMBOL)
            TIMES_SYMBOL -> match(TIMES_SYMBOL)
            DIVIDE_SYMBOL -> match(DIVIDE_SYMBOL)
            else -> throw Exception("Invalid operator at ${currentToken.row}:${currentToken.column}")
        }
    }

    private fun expressionList() {
        when (currentToken.symbol) {
            RBRACE_SYMBOL -> return
            else -> {
                expression()
                expressionListTail()
            }
        }
    }

    private fun expressionListTail() {
        when (currentToken.symbol) {
            COMMA_SYMBOL -> {
                match(COMMA_SYMBOL)
                expression()
                expressionListTail()
            }
        }
    }

    private fun functionDefinition() {
        match(FUNCTION_SYMBOL)
        match(IDENTIFIER_SYMBOL)
        match(LPAREN_SYMBOL)
        parameterList()
        match(RPAREN_SYMBOL)
        match(LBRACE_SYMBOL)
        innerList()
        match(RBRACE_SYMBOL)
    }


    private fun innerList() {
        when (currentToken.symbol) {
            EOF_SYMBOL, RBRACE_SYMBOL -> return
            else -> {
                inner()
                innerList()
            }
        }
    }

    private fun inner() {
        when (currentToken.symbol) {
            VAR_SYMBOL -> variableDeclaration()
            ARRAY_SYMBOL -> arrayDeclaration()
            FUNCTION_SYMBOL -> functionDefinition()
            CALL_SYMBOL -> functionCall()
            FOR_SYMBOL -> forLoop()
            IF_SYMBOL -> ifStatement()
            POI_SYMBOL, REPORT_SYMBOL, GROUP_SYMBOL, EVENT_SYMBOL -> block()
            else -> throw Exception("Invalid statement start at ${currentToken.row}:${currentToken.column}. Found '${name(currentToken.symbol)}'")
        }
    }

    private fun parameterList() {
        when (currentToken.symbol) {
            RPAREN_SYMBOL -> return
            else -> {
                match(IDENTIFIER_SYMBOL)
                parameterListTail()
            }
        }
    }

    private fun parameterListTail() {
        when (currentToken.symbol) {
            COMMA_SYMBOL -> {
                match(COMMA_SYMBOL)
                match(IDENTIFIER_SYMBOL)
                parameterListTail()
            }
        }
    }

    private fun functionCall() {
        match(CALL_SYMBOL)
        match(IDENTIFIER_SYMBOL)
        match(LPAREN_SYMBOL)
        argumentList()
        match(RPAREN_SYMBOL)
        match(SEMI_SYMBOL)
    }

    private fun argumentList() {
        when (currentToken.symbol) {
            RPAREN_SYMBOL -> return
            else -> {
                expression()
                argumentListTail()
            }
        }
    }

    private fun argumentListTail() {
        when (currentToken.symbol) {
            COMMA_SYMBOL -> {
                match(COMMA_SYMBOL)
                expression()
                argumentListTail()
            }
        }
    }

    private fun cityBlock() {
        match(CITY_SYMBOL)
        matchStringOrIdentifier()
        match(LBRACE_SYMBOL)
        innerList()
        match(RBRACE_SYMBOL)
    }

    private fun matchStringOrIdentifier() {
        when (currentToken.symbol) {
            STRING_SYMBOL, IDENTIFIER_SYMBOL -> match(currentToken.symbol)
            else -> throw Exception("Expected string or identifier at ${currentToken.row}:${currentToken.column}, found ${name(currentToken.symbol)}")
        }
    }

    private fun forLoop() {
        match(FOR_SYMBOL)
        match(IDENTIFIER_SYMBOL)
        match(IN_SYMBOL)
        match(NUMBER_SYMBOL)
        match(TO_SYMBOL)
        match(NUMBER_SYMBOL)
        match(LBRACE_SYMBOL)
        innerList()
        match(RBRACE_SYMBOL)
    }

    private fun ifStatement() {
        match(IF_SYMBOL)
        expression()
        match(LBRACE_SYMBOL)
        innerList()
        match(RBRACE_SYMBOL)
    }

    private fun block() {
        when (currentToken.symbol) {
            POI_SYMBOL -> poiBlock()
            REPORT_SYMBOL -> reportBlock()
            GROUP_SYMBOL -> groupBlock()
            EVENT_SYMBOL -> eventBlock()
            else -> throw Exception("Invalid syntax at ${currentToken.row}:${currentToken.column}. Expected block, found ${name(currentToken.symbol)}")
        }
    }

    private fun poiBlock() {
        match(POI_SYMBOL)
        expression()
        match(LBRACE_SYMBOL)
        locationStatement()
        typeStatement()
        match(RBRACE_SYMBOL)
    }

    private fun reportBlock() {
        match(REPORT_SYMBOL)
        expression()
        match(LBRACE_SYMBOL)
        photoStatement()
        noteStatement()
        locationStatement()
        match(RBRACE_SYMBOL)
    }

    private fun groupBlock() {
        match(GROUP_SYMBOL)
        expression()
        match(LBRACE_SYMBOL)
        userStatementList()
        match(RBRACE_SYMBOL)
    }

    private fun userStatementList() {
        when (currentToken.symbol) {
            RBRACE_SYMBOL -> return
            else -> {
                userStatement()
                userStatementList()
            }
        }
    }

    private fun eventBlock() {
        match(EVENT_SYMBOL)
        expression()
        match(LBRACE_SYMBOL)
        userStatement()
        groupBlock()
        locationStatement()
        timeStatement()
        authorityStatement()
        sponsorStatement()
        utilityOpt()
        match(RBRACE_SYMBOL)
    }

    private fun utilityOpt() {
        when (currentToken.symbol) {
            UTILITY_SYMBOL -> utilityStatement()
        }
    }

    private fun userStatement() {
        match(USER_SYMBOL)
        match(LPAREN_SYMBOL)
        matchStringOrIdentifier()
        match(COMMA_SYMBOL)
        matchStringOrIdentifier()
        match(RPAREN_SYMBOL)
    }

    private fun photoStatement() {
        match(PHOTO_SYMBOL)
        match(LPAREN_SYMBOL)
        matchStringOrIdentifier()
        match(COMMA_SYMBOL)
        matchStringOrIdentifier()
        match(RPAREN_SYMBOL)
    }

    private fun noteStatement() {
        match(NOTE_SYMBOL)
        match(LPAREN_SYMBOL)
        matchStringOrIdentifier()
        match(RPAREN_SYMBOL)
    }

    private fun sponsorStatement() {
        match(SPONSOR_SYMBOL)
        match(LPAREN_SYMBOL)
        matchStringOrIdentifier()
        match(RPAREN_SYMBOL)
    }

    private fun utilityStatement() {
        match(UTILITY_SYMBOL)
        match(LPAREN_SYMBOL)
        matchStringOrIdentifier()
        match(RPAREN_SYMBOL)
    }

    private fun locationStatement() {
        match(LOCATION_SYMBOL)
        match(LPAREN_SYMBOL)
        coordinates()
        match(RPAREN_SYMBOL)
    }

    private fun typeStatement() {
        match(TYPE_SYMBOL)
        match(LPAREN_SYMBOL)
        matchStringOrIdentifier()
        match(RPAREN_SYMBOL)
    }

    private fun timeStatement() {
        match(TIME_SYMBOL)
        match(LPAREN_SYMBOL)
        matchStringOrIdentifier()
        match(RPAREN_SYMBOL)
    }

    private fun authorityStatement() {
        match(AUTHORITY_SYMBOL)
        match(LPAREN_SYMBOL)
        matchStringOrIdentifier()
        match(RPAREN_SYMBOL)
    }

    private fun coordinates(){
        match(COORDS_SYMBOL)
        match(LPAREN_SYMBOL)
        expression()
        match(COMMA_SYMBOL)
        expression()
        match(RPAREN_SYMBOL)
    }

}

fun main() {
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
