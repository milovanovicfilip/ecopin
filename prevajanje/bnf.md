# BNF
```
Program ::= StatementList

StatementList ::= Statement StatementList | ε

Statement ::= VariableDeclaration
            | ArrayDeclaration
            | FunctionDefinition
            | FunctionCall
            | CityBlock
            | ForLoop
            | IfStatement

VariableDeclaration ::= "var" Identifier "=" Expression ";"

ArrayDeclaration ::= "array" Identifier "<" Type ">" "[" ExpressionList "]" ";"
Type ::= "poi" | "user" | "string" | "number"


Expression ::= Term ExpressionTail
ExpressionTail ::= Operator Term ExpressionTail | ε

Term ::= Number
        | String
        | Identifier
        | Coordinates
        | "(" Expression ")"
        | Block

Operator ::= "+" | "-" | "*" | "/"

ExpressionList ::= Expression ExpressionListTail | ε
ExpressionListTail ::= "," Expression ExpressionListTail | ε

FunctionDefinition ::= "function" Identifier "(" ParameterList ")" "{" InnerList "}"

InnerList ::= Inner InnerList | ε

Inner ::= VariableDeclaration
            | ArrayDeclaration
            | FunctionDefinition
            | FunctionCall
            | ForLoop
            | IfStatement
            | Block
            
ParameterList ::= Identifier ParameterListTail | ε
ParameterListTail ::= "," Identifier ParameterListTail | ε

FunctionCall ::= "call" Identifier "(" ArgumentList ")" ";"

ArgumentList ::= Expression ArgumentListTail | ε
ArgumentListTail ::= "," Expression ArgumentListTail | ε

CityBlock ::= "city" Name "{" InnerList "}"

Name ::= String | Identifier

ForLoop ::= "for" Identifier "in" Number "to" Number "{" InnerList "}"

IfStatement ::= "if" Expression "{" InnerList "}"

Block ::= PoiBlock
        | ReportBlock
        | GroupBlock
        | EventBlock

PoiBlock ::= "poi" Expression "{" LocationStatement TypeStatement "}"

ReportBlock ::= "report" Expression "{" PhotoStatement NoteStatement LocationStatement "}

GroupBlock ::= "group" Expression "{" UserStatementList "}"

UserStatementList ::= UserStatement UserStatementList | ε

EventBlock ::= "event" Expression "{" UserStatement GroupBlock LocationStatement TimeStatement AuthorityStatement SponsorStatement UtilityOpt "}"

UtilityOpt ::= UtilityStatement | ε

UserStatement ::= "user" "(" Name "," Name ")"

PhotoStatement ::= "photo" "(" Name "," Name ")"

NoteStatement ::= "note" "(" Name ")"

SponsorStatement ::= "sponsor" "(" Name ")"

UtilityStatement ::= "utility" "(" Name ")"

LocationStatement ::= "location" "(" Coordinates ")"

TypeStatement ::= "type" "(" Name ")"

TimeStatement ::= "time" "(" Name ")"

AuthorityStatement ::= "authority" "(" Name ")"

Coordinates ::= "coordinates" "(" Expression ", " Expression ")"

Identifier ::= /[a-zA-Z][a-zA-Z0-9_]*/
String ::= /"([^"\\]|\\.)*"/
Number ::= /-?[0-9]+(\.[0-9]+)?/
```

# First in Follow mnozici
## First
```
First (Program) = "var", "array", "function", identifier, "city", "for", "if"
First (Statement) = "var", "array", "function", identifier, "city", "for", "if"
First (VariableDeclaration) = "var"
First (ArrayDeclaration) = "array"
First (FunctionDefinition) = "function"
First (FunctionCall) = identifier
First (CityBlock) = "city"
First (ForLoop) = "for"
First (IfStatement) = "if"
First (Expression) = number, string, identifier, "("
First (Block) = "poi", "report", "group", "event"
First (PoiBlock) = "poi"
First (ReportBlock) = "report"
First (GroupBlock) = "group"
First (EventBlock) = "event"
```
## Follow
```
Follow (Program) = $
Follow (Statement) = 
Follow (Expression) = ",", ")", ";"
Follow (StatementList) = "}", $
Follow (BlockList) = "}"
Follow (ParameterList) = ")"
Follow (ArgumentList) = ")"
Follow (UserStatementList) = "}"
Follow (ExpressionList) = "]"
```