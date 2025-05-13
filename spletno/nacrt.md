# Načrt
## Osnovne informacije o ekipi
- Ime ekipe - EcoPin
- Ime projekta - EkoPin
- Člani
    - Vodja skupine | Filip Milovanović (E1163108)
    - Član 1 | Erika Florjanc (E1170111)
    - Član 2 | Vukašin Ćurguz (E1163935)
## Opis
Digitalni dvojček bo simuliral stanje odpadkov v mestih in omogočal napovedovanje potreb čiščenja, ter bo prikazoval lokacije košev, zbirališč, ter ekoloških otokov.
## Nabor podatkov
### Osnovni podatki
- Lokacije odpadkov (geografske koordinate, tip smeti, količina, fotografija, čas, uporabnik ID)
- Lokacije javnih košev (https://overpass-turbo.eu/)
- Lokacije ekoloških otokov (npr. za Novo Mesto: https://podatki.gov.si/dataset/seznam-ekoloskih-otokov-v-mestni-obcini-novo-mesto) (več vrst)
- Lokacije zbirališč (npr. za Ljubljano (Snaga): https://www.vokasnaga.si/zbiranje-odvoz-odpadkov/zbirni-centri) (več vrst)
### Dodatne funkcionalnosti
V aplikaciji bo vzpostavljen sistem uporabnikov (JWT + Google Auth + GitHub OAuth). Na strani administratorja bo vidna bolj podrobna statistika, ter pobarvani zemljevid odvisno od količine smeti v tistem delu (D3.js). Tako na strani uporabnika, kot na strani administratorja, bomo lahko označili določeno območje za prikaz določenih komponent iz našega nabora podatkov (geospatial queries).
## Razdelitev dela
https://vinfillabs.atlassian.net/jira/software/projects/OPS/boards/1/timeline?timeline=WEEKS
