# tietokantaohjelmointi

Repositorio TUNI kurssin DATA.DB.210: Tietokantaohjelmointi ryhmätyölle.

Sovellus on rakennettu Node.js- ja Angular-teknologioilla, ja taustalla toimii PostgreSQL-tietokanta.

## Sovelluksen kuvaus

Kyseessä on kuvitteellinen verkkopalvelu, jossa käytettyjä kirjoja myydään usean antikvariaatin (divarin) yhteisen keskusdivari-alustan kautta.

- Käyttäjät voivat kirjautua sisään, selata kirjoja, tehdä tilauksia ja tarkastella tilaushistoriaansa.
- Divarien ja keskusdivarin ylläpitäjät voivat lisätä uusia teoksia. Divarien ylläpitäjät voivat lisätä teosten myyntikappaleita.
- Divarien ja keskusdivarin ylläpitäjät voivat tarkastella raportteja.

## Sovelluksen asennus ja ajaminen lokaalisti

1. **Kloonaa projekti ja siirry sen juurihakemistoon**:

    `git clone https://github.com/SalonenTeemu/tietokantaohjelmointi.git`

    ja

    `cd tietokantaohjelmointi`

2. **Asenna riippuvuudet backendiin ja frontendiin**: `npm run install:all`.

3. **Käynnistä sekä backend että frontend**: `npm run start` tai kehitystilassa `npm run dev`.

4. **Sovellus löytyy osoitteesta**: `http://localhost:8040` ja palvelin käyttää porttia `8041`.
