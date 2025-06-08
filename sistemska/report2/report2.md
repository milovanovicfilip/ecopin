# Projektna naloga - CI/CD
## Docker Hub container registry
### Ustvarjanje Docker Hub računa
Vodja mikro-skupine je ustvaril račun na https://hub.docker.com. Po uspešni registraciji smo ustvarili dva repozitorija:
* `ecopin-backend` (privatni)
* `ecopin-frontend` (javen)

Ob prvem `docker build` in `docker push` se repozitoriji samodejno ustvarijo, lahko pa tudi ročno – kot smo mi naredili.
![ss2](screenshots/ss2.png)
### Uporabljeni ukazi v CLI
```
docker login
docker build -t filipmilovanovic/[ecopin-backend ali ecopin-frontend]:[dev ali test ali latest] [./spletno/backend ali ./spletno/frontend]
docker push filipmilovanovic/[ecopin-backend ali ecopin-frontend]:[dev ali test ali latest]
docker pull filipmilovanovic/[ecopin-backend ali ecopin-frontend]:[dev ali test ali latest]
docker run -p [port]:[port] filipmilovanovic/[ecopin-backend ali ecopin-frontend]:[dev ali test ali latest]
```
Prijava v Docker Hub je bila izvedena z ukazom `docker login`, kjer smo kot geslo uporabili personal access token:
![ss1](screenshots/ss1.png)
## GitHub Actions workflow
### Organizacija `.yml` datotek
V glavni mapi repozitorija smo ustvarili mapo `.github/workflows`, kamor smo dodali 3 `.yml` datoteke:

![ss3](screenshots/ss3.png)

### Funkcionalnost workflow-ov
Vsak workflow:
- se prijavi na Docker Hub
- ustvari Docker sliko
- jo naloži na Docker Hub
- pošlje webhook sporočilo strežniku (če push uspe).

### Različna okolja in možne razširitve
* `:dev` (branch `dev`): razvojno okolje – možno dodati `ESLint/Prettier`
* `:test` (branch `release`): testno okolje – možno dodati unit teste (`Jest/Cypres`)
* `:latest` (branch `main`): produkcijsko okolje – uporablja se v `redeploy.sh`, trenutna aplikacija na http://20.73.3.104/

![ss4](screenshots/ss4.png)
![ss5](screenshots/ss5.png)
![ss6](screenshots/ss6.png)

Docker slike se vedno gradijo iz ustrezne podmape v `./spletno`. Tako vidimo v posameznih container-ih so samo datoteke iz `backend` ali `frontend`.
![ss7](screenshots/ss7.png)

#### Prikaz delovanja workflow-a za `dev` okolje
![ss17](screenshots/ss17.png)
![ss18](screenshots/ss18.png)
* Mogli smo uporabit trenutni branch za to vajo, ker v tistem trenutku nismo imeli česa pushat na `dev`.

### Uporaba GitHub Secrets
Vse privatne informacije (tokeni, URL-ji) so shranjene v `Settings > Secrets and variables > Actions`:
![ss8](screenshots/ss8.png)

## Webhook
Uporabili smo Node.js strežnik z Express (`webhook.js`), ki sprejme `POST` zahtevo GitHub Action-a in zažene `redeploy.sh`, ki:
* ustavi obstoječ container
* pull-a najnovejši image
* zažene novi container iz novega image-a

Obe datoteki sta izven GitHub repozitorija.

![ss10](screenshots/ss10.png)

![ss9](screenshots/ss9.png)

Webhook `secret` si sami definiramo (ni obvezen, ampak močno priporočljiv).

![ss11](screenshots/ss11.png)
 
## Varnost v Webhook
### Izvede zaščite
* `webhook.js` se zažene z `pm2` (samodejno ob restartu strežnika)
![ss12](screenshots/s12.png)
* preverjanje z `WEBHOOK_SECRET` tokenom
* logiranje vseh izhodov (prikazano v `redeploy.sh`)
* dovolimo `POST` zahteve samo:
    * iz GitHub subnetov (primer: `192.30.252.0/22`)
    * z `localhosta` (zaradi `~/deploy/manual_redeploy.sh`, ki v bistvu dela isto kot GitHub Actions (pol pa poklice Webhook za ostanek dela))
![s13](screenshots/s13.png)
![ss14](screenshots/ss14.png)
![ss15](screenshots/ss15.png)
#### manual_redeploy.sh skripta:
![ss16](screenshots/ss16.png)




