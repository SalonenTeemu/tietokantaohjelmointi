import db from './knex';
import { keskusdivari } from './initDb';

// Tarkasta löytyykö näkymää jo
const checkView = async (view: string, schema: string) => {
    const viewExists = await db.raw(`
        SELECT EXISTS (
            SELECT 1 
            FROM information_schema.views 
            WHERE table_schema = '${schema}' AND table_name = '${view}'
        ) as view_exists;
    `);
    return viewExists.rows[0].view_exists;
};

// Luo näkymä, jos sitä ei ole olemassa
const createView = async (schema: string, view: string, query: string) => {
    const exists = await checkView(view, schema);
    if (exists) {
        await db.raw(`DROP VIEW IF EXISTS "${schema}"."${view}"`);
    }
    await db.raw(`CREATE VIEW "${schema}"."${view}" AS ${query}`);
};

// Näkymä hakukyselyille (R1)
const createHakunäkymä = async () => {
    const schema = keskusdivari;
    const view = 'HakuNakyma';
    const query = `
        SELECT 
            t."teosId" AS id,
            t."isbn" AS isbn, 
            t."nimi" AS nimi, 
            t."tekija" AS tekija, 
            ty."nimi" AS tyyppi, 
            l."nimi" AS luokka, 
            ti."hinta" AS hinta, 
            ti."tila" AS tila, 
            ti."kunto" AS kunto, 
            d."nimi" AS "divariNimi"
        FROM "${schema}"."Teos" t
        JOIN "${schema}"."TeosInstanssi" ti ON t."teosId" = ti."teosId"
        JOIN "${schema}"."Divari" d ON ti."divariId" = d."divariId"
        JOIN "${schema}"."Tyyppi" ty ON t."tyyppiId" = ty."tyyppiId"
        JOIN "${schema}"."Luokka" l ON t."luokkaId" = l."luokkaId";
    `;
    await createView(schema, view, query);
};

// Näkymä tietyn luokan myynnissä olevista teoksista (R2)
const createLuokanMyynnissaOlevatTeokset = async () => {
    const schema = keskusdivari;
    const view = 'LuokanMyynnissaOlevatTeokset';
    const query = `
        SELECT
            l.nimi AS luokka, 
            COUNT(ti."teosInstanssiId") AS "lkmMyynnissa", 
            SUM(ti.hinta) AS "kokonaisMyyntihinta", 
            AVG(ti.hinta) AS "keskiMyyntihinta"
        FROM ${schema}."TeosInstanssi" ti
        JOIN ${schema}."Teos" t ON ti."teosId" = t."teosId"
        JOIN ${schema}."Luokka" l ON t."luokkaId" = l."luokkaId"
        WHERE ti.tila = 'vapaa'
        GROUP BY l.nimi;
    `;
    await createView(schema, view, query);
};

// Näkymä raportille asiakkaiden viime vuonna ostamien teosten lukumäärästä (R3):
const createAsiakasRaporttiViimeVuosi = async () => {
    const schema = keskusdivari;
    const view = 'AsiakasRaporttiViimeVuosi';
    const query = `
        SELECT
            K."kayttajaId" AS "kayttajaId",
            K.nimi AS asiakas, 
            K.email AS email,
            COUNT(*) AS "ostettujenTeostenLkm"
        FROM 
            ${schema}."Kayttaja" K
        JOIN 
            ${schema}."Tilaus" T ON K."kayttajaId" = T."kayttajaId"
        JOIN 
            ${schema}."TeosInstanssi" TI ON T."tilausId" = TI."tilausId"
        WHERE 
            T.tilauspvm >= DATE_TRUNC('year', CURRENT_DATE) - INTERVAL '1 year'
            AND T.tilauspvm < DATE_TRUNC('year', CURRENT_DATE)
        GROUP BY 
            K."kayttajaId", K.nimi, K.email;
    `;
    await createView(schema, view, query);
};

export const initViews = async () => {
    try {
        await createHakunäkymä();
        await createLuokanMyynnissaOlevatTeokset();
        await createAsiakasRaporttiViimeVuosi();
        console.log('Näkymät luotu');
    } catch (err) {
        console.error('Virhe näkymien luonnissa');
        console.error(err);
    }
};