Program ::= ElementList

ElementList ::= Element ElementList | ε

Element ::= "city" String "{" BlockList "}"

BlockList ::= Block BlockList | ε

Block ::= RoadBlock | BuildingBlock | PoiBlock | ReportBlock

RoadBlock ::= "road" String "{" CommandList "}"

BuildingBlock ::= "building" String "{" CommandList "}"

PoiBlock ::= EcoIsland | Bin | DisposalSite

EcoIsland ::= "eco-island" String "{" "circ" "(" Point "," Number ")" ";" "}"

Bin ::= "bin" Point ";"

DisposalSite ::= "disposal-site" String "{" "box" "(" Point "," Point ")" ";" "}"

ReportBlock ::= "report" Point ReportMeta

ReportMeta ::= "{" "severity" "(" String ")" ";" "}" | ";"

CommandList ::= Command CommandList | ε

Command ::= "line" "(" Point "," Point ")" ";" | "bend" "(" Point "," Point "," Number ")" ";" | "box"  "(" Point "," Point ")" ";" | "circ" "(" Point "," Number ")" ";" | "polygon" "(" PointList ")" ";"

PointList ::= Point PointListTail
PointListTail ::= "," Point PointListTail | ε


Point ::= "(" Number "," Number ")"


String ::= "\"" [a-zA-Z0-9 _\-]+ "\""
Number ::= [0-9]+(\.[0-9]+)?
