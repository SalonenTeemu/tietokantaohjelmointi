import { Knex } from 'knex';
import db from '../knex';

// Hae teosIntanssi ID:n perusteella keskusdivarista
export const haeTeosInstanssi = async (teosInstanssiId: string) => {
	const instanssi = await db('keskusdivari.TeosInstanssi').where('teosInstanssiId', teosInstanssiId).first();
	return instanssi;
};

// Lisää uusi teosInstanssi tietokantaan. Jos tietokantaa ei annettu, käytetään keskusdivaria.
export const lisaaUusiTeosInstanssi = async (instanssi: any, tietokanta = 'keskusdivari') => {
	await db(tietokanta + '.TeosInstanssi').insert(instanssi);
};

// Päivitä teosInstanssin tila ID:n perusteella keskusdivarista
export const paivitaTeosInstanssinTila = async (teosInstanssiId: string, uusiTila: string, trx: Knex.Transaction) => {
	await db('keskusdivari.TeosInstanssi').where('teosInstanssiId', teosInstanssiId).update({ tila: uusiTila }).transacting(trx);
};

// Päivitä teosInstanssin tilaus ID:n perusteella keskusdivarista
export const paivitaTeosInstanssinTilaus = async (teosInstanssiId: string, tilausId: number | null, trx: Knex.Transaction) => {
	await db('keskusdivari.TeosInstanssi').where('teosInstanssiId', teosInstanssiId).update({ tilausId }).transacting(trx);
};

// Aseta teosInstanssin myyntipäivämäärä ID:n perusteella keskusdivarista
export const asetaTeosInstanssinMyyntiPvm = async (teosInstanssiId: string, myyntipvm: Date, trx: Knex.Transaction) => {
	await db('keskusdivari.TeosInstanssi').where('teosInstanssiId', teosInstanssiId).update({ myyntipvm }).transacting(trx);
};

// Hae asiakkaiden viime vuoden ostot keskusdivarista
export const haeAsiakkaidenViimeVuodenOstot = async () => {
	const raportti = await db('keskusdivari.AsiakasRaporttiViimeVuosi').select('*');
	return raportti;
};
