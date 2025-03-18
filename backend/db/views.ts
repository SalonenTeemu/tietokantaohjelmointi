import db from './knex';
import { keskusdivari } from './initDb';

// Tarkasta löytyykö näkymää jo
const tarkastaNakyma = async (view: string, schema: string) => {
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
const luoNakyma = async (schema: string, view: string, query: string) => {
	const exists = await tarkastaNakyma(view, schema);
	if (exists) {
		await db.raw(`DROP VIEW IF EXISTS "${schema}"."${view}"`);
	}
	await db.raw(`CREATE VIEW "${schema}"."${view}" AS ${query}`);
};

// Näkymä hakukyselyille (R1)
const luoHakunakyma = async () => {
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
	await luoNakyma(schema, view, query);
};

// Näkymä tietyn luokan myynnissä olevista teoksista (R2)
const luoLuokanMyynnissaOlevatTeoksetNakyma = async () => {
	const schema = keskusdivari;
	const view = 'LuokanMyynnissaOlevatTeokset';
	const query = `
        SELECT
            l.nimi AS luokka, 
            ti."divariId" AS "divariId",
            COUNT(ti."teosInstanssiId") AS "lkmMyynnissa", 
            COUNT(DISTINCT t."teosId") AS "lkmTeoksia",
            SUM(ti.hinta) AS "kokonaisMyyntihinta", 
            AVG(ti.hinta) AS "keskiMyyntihinta"
        FROM ${schema}."TeosInstanssi" ti
        JOIN ${schema}."Teos" t ON ti."teosId" = t."teosId"
        JOIN ${schema}."Luokka" l ON t."luokkaId" = l."luokkaId"
        WHERE ti.tila = 'vapaa'
        GROUP BY l.nimi, ti."divariId";
    `;
	await luoNakyma(schema, view, query);
};

// Näkymä raportille asiakkaiden viime vuonna ostamien teosten lukumäärästä (R3):
const luoAsiakasRaporttiViimeVuosiNakyma = async () => {
	const schema = keskusdivari;
	const view = 'AsiakasRaporttiViimeVuosi';
	const query = `
        SELECT
            K."kayttajaId" AS "kayttajaId",
            K.rooli AS rooli,
            K.nimi AS nimi, 
            K.email AS email,
            T.tila AS tila,
            COUNT(*) AS "ostettujenTeostenLkm"
        FROM 
            ${schema}."Kayttaja" K
        JOIN 
            ${schema}."Tilaus" T ON K."kayttajaId" = T."kayttajaId"
        JOIN 
            ${schema}."TeosInstanssi" TI ON T."tilausId" = TI."tilausId"
        WHERE
            T.tila = 'valmis'
            AND K.rooli = 'asiakas'
            AND T.tilauspvm >= DATE_TRUNC('year', CURRENT_DATE) - INTERVAL '1 year'
            AND T.tilauspvm < DATE_TRUNC('year', CURRENT_DATE)
        GROUP BY 
            K."kayttajaId", K.nimi, K.email, K.rooli, T.tila;
    `;
	await luoNakyma(schema, view, query);
};

// Luo kaikki näkymät
export const luoNakymat = async () => {
	try {
		await luoHakunakyma();
		await luoLuokanMyynnissaOlevatTeoksetNakyma();
		await luoAsiakasRaporttiViimeVuosiNakyma();
		console.log('Näkymät luotu onnistuneesti');
	} catch (err) {
		console.error('Virhe näkymien luonnissa');
		console.error(err);
	}
};
