import { Knex } from 'knex';
import db from '../knex';

// Hae teosIntanssi
export const haeTeosInstanssi = async (teosInstanssiId: string) => {
	const instanssi = await db('keskusdivari.TeosInstanssi').where('teosInstanssiId', teosInstanssiId).first();
	return instanssi;
};

// Lisää uusi teosInstanssi
export const lisaaUusiTeosInstanssi = async (instanssi: any, tietokanta = 'keskusdivari') => {
	await db(tietokanta + '.TeosInstanssi').insert(instanssi);
};

// Päivitys teosInstanssin tila
export const paivitaTeosInstanssinTila = async (teosInstanssiId: string, uusiTila: string, trx: Knex.Transaction) => {
	await db('keskusdivari.TeosInstanssi').where('teosInstanssiId', teosInstanssiId).update({ tila: uusiTila }).transacting(trx);
};

// Päivitä teosInstanssin tilaus
export const paivitaTeosInstanssinTilaus = async (teosInstanssiId: string, tilausId: number | null, trx: Knex.Transaction) => {
	await db('keskusdivari.TeosInstanssi').where('teosInstanssiId', teosInstanssiId).update({ tilausId }).transacting(trx);
};

// Aseta teosInstanssin myyntipäivämäärä
export const asetaTeosInstanssinMyyntiPvm = async (teosInstanssiId: string, myyntipvm: Date, trx: Knex.Transaction) => {
	await db('keskusdivari.TeosInstanssi').where('teosInstanssiId', teosInstanssiId).update({ myyntipvm }).transacting(trx);
};

// Hae asiakkaiden viime vuoden teosostot
export const haeAsiakkaidenViimeVuodenOstot = async () => {
	const raportti = await db('keskusdivari.AsiakasRaporttiViimeVuosi').select('*');
	return raportti;
};
