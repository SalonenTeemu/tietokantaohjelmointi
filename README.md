# tietokantaohjelmointi

Repositorio TUNI kurssin DATA.DB.210: Tietokantaohjelmointi ryhmätyölle.

Tämä on Node.js ja Angular -pohjainen sovellus, jossa käytetään PostgreSQL tietokantaratkaisuna.

## Sovelluksen asennus ja ajaminen

1. **Kloonaa projekti ja siirry sen juurihakemistoon**:

    `git clone https://github.com/SalonenTeemu/tietokantaohjelmointi.git`

    ja

    `cd tietokantaohjelmointi`

2. **Asenna riippuvuudet backendiin ja frontendiin**: `npm run install:all`.

3. **Käynnistä sekä backend että frontend**: `npm run start` tai kehitystilassa `npm run dev`.

4. **Sovellus löytyy osoitteesta**: `http://localhost:8040` ja palvelin käyttää porttia `8041`.

## TODO

- lisää uusi teos
- lisää uusi teosinstanssi
- autentikaatio sen vaatimiin endpointteihin ja frontendin toteutus -> oman divarin admin ym.
- divarin tietojen muokkaus
- ilmoitukset sovelluksen frontendiin
- raportit admin käyttäjille
- triggeri divarien synkronoimiseksi
- UI tyylin parantaminen ja selkeytys
- frontend authorization sivuille ym.
- tarkista hakutoiminto, vastaako oletettua (R4)
