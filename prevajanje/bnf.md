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

ExpressionList ::= Expression ExpressionListTail | ε
ExpressionListTail ::= "," Expression ExpressionListTail | ε

FunctionDefinition ::= "function" Identifier "(" ParameterList ")" "{" { StatementList } "}"

ParameterList ::= Identifier ParameterListTail | ε
ParameterListTail ::= "," Identifier ParameterListTail | ε

FunctionCall ::= Identifier "(" ArgumentList ")" ";"

ArgumentList ::= Expression ArgumentListTail | ε
ArgumentListTail ::= "," Expression ArgumentListTail | ε

CityBlock ::= "city" String "{" BlockList "}"

BlockList ::= Block BlockList | ε

ForLoop ::= "for" Identifier "in" Number "to" Number "{" StatementList "}"

IfStatement ::= "if" Expression "{" StatementList "}"

Expression ::= Term ExpressionTail
ExpressionTail ::= Operator Term ExpressionTail | ε

Term ::= Number
        | String
        | Identifier
        | Coordinates

Operator ::= "+" | "-" | "*" | "/"

Type ::= "poi" | "user" | "string" | "number"
```
## Bloki
```
Block ::= PoiBlock
        | ReportBlock
        | GroupBlock
        | EventBlock

PoiBlock ::= "poi" String "{" LocationStatement TypeStatement "}"

ReportBlock ::= "report" String "{" PhotoStatement NoteStatement LocationStatement "}

GroupBlock ::= "group" String "{" UserStatementList "}"

UserStatementList ::= UserStatement UserStatementList | ε

EventBlock ::= "event" String "{" UserStatement GroupBlock LocationStatement TimeStatement AuthorityStatement SponsorStatement UtilityOpt "}"

UtilityOpt ::= UtilityStatement | ε
```
## Statements / Konstrukti
```
UserStatement ::= "user" "(" String "," String ")" ";"

PhotoStatement ::= "photo" "(" FileName "," String ")"

NoteStatement ::= "note" "(" String ")"

SponsorStatement ::= "sponsor" "(" String ")"

UtilityStatement ::= "utility" "(" String ")"

LocationStatement ::= "location" "(" Expression "," Expression ")"

TypeStatement ::= "type" "(" String ")"

TimeStatement ::= "time" "(" String ")"

AuthorityStatement ::= "authority" "(" String ")"

Coordinates ::= "(" Number ", " Number ")"
```

## Basic Components / Osnovne enote
```
Identifier ::= /[a-zA-Z][a-zA-Z0-9_]*/
FileName ::= /[a-zA-Z0-9_\-]+\.(jpg|jpeg|png|gif|bmp|webp|tiff)/i
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