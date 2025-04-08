import db from './knex';
import { keskusdivari } from './initDb';

// Tarkista, onko näkymä olemassa. Palauttaa true, jos näkymä löytyy, muuten false.
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
	if (!exists) await db.raw(`CREATE VIEW "${schema}"."${view}" AS ${query}`);
};

// Luo näkymä luokan myynnissä olevista teoksista divareittain.
const luoDivariLuokkaMyyntiNakyma = async () => {
	const schema = keskusdivari;
	const view = 'LuokanMyynnissaOlevatTeoksetDivari';
	const query = `
        SELECT
            l.nimi AS luokka, 
            ti."divariId" AS "divariId",
            COUNT(ti."teosInstanssiId") AS "lkmMyynnissa", 
            COUNT(DISTINCT t."teosId") AS "lkmTeoksia",
            ROUND(SUM(ti.hinta), 2) AS "kokonaisMyyntihinta", 
            ROUND(AVG(ti.hinta), 2) AS "keskiMyyntihinta"
        FROM ${schema}."TeosInstanssi" ti
        JOIN ${schema}."Teos" t ON ti."teosId" = t."teosId"
        JOIN ${schema}."Luokka" l ON t."luokkaId" = l."luokkaId"
        WHERE ti.tila = 'vapaa'
        GROUP BY l.nimi, ti."divariId";
    `;
	await luoNakyma(schema, view, query);
};

// Luo näkymä kaikista luokan myynnissä olevista teoksista keskusdivarissa.
const luoKeskusdivariLuokkaMyyntiNakyma = async () => {
	const schema = keskusdivari;
	const view = 'LuokanMyynnissaOlevatTeoksetKeskusdivari';
	const query = `
        SELECT
            l.nimi AS luokka, 
            COUNT(ti."teosInstanssiId") AS "lkmMyynnissa", 
            COUNT(DISTINCT t."teosId") AS "lkmTeoksia",
            ROUND(SUM(ti.hinta), 2) AS "kokonaisMyyntihinta", 
            ROUND(AVG(ti.hinta), 2) AS "keskiMyyntihinta"
        FROM ${schema}."TeosInstanssi" ti
        JOIN ${schema}."Teos" t ON ti."teosId" = t."teosId"
        JOIN ${schema}."Luokka" l ON t."luokkaId" = l."luokkaId"
        WHERE ti.tila = 'vapaa'
        GROUP BY l.nimi;
    `;
	await luoNakyma(schema, view, query);
};

// Luo näkymä asiakkaiden viime vuoden teosten ostotiedoista
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
		await luoDivariLuokkaMyyntiNakyma();
		await luoAsiakasRaporttiViimeVuosiNakyma();
		await luoKeskusdivariLuokkaMyyntiNakyma();
		console.log('Näkymät luotu onnistuneesti');
	} catch (err) {
		console.error('Virhe näkymien luonnissa');
		console.error(err);
	}
};
