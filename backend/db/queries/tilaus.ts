import db from '../knex';
import { Knex } from 'knex';

// Hae tilaus ID:n perusteella keskusdivarista
export const haeTilaus = async (tilausId: number) => {
	const tilaus = await db('keskusdivari.Tilaus').where('tilausId', tilausId).first();
	return tilaus;
};

// Lisää uusi tilaus ja palauta tilauksen ID ja postikulut. Käytä transaktiota.
export const lisaaTilaus = async (tilausTiedot: any, trx: Knex.Transaction) => {
	const tilaus = await db('keskusdivari.Tilaus')
		.insert(tilausTiedot)
		.returning(['tilausId', 'postikulut'])
		.transacting(trx)
		.then((rows) => rows[0]);
	return tilaus;
};

// Päivitä tilauksen tila ID:n perusteella keskusdivarista. Käytä transaktiota, jos trx on määritelty.
export const paivitaTilauksenTila = async (tilausId: number, uusiTila: string, trx?: Knex.Transaction) => {
	if (!trx) {
		await db('keskusdivari.Tilaus').where('tilausId', tilausId).update({ tila: uusiTila });
	} else {
		await db('keskusdivari.Tilaus').where('tilausId', tilausId).update({ tila: uusiTila }).transacting(trx);
	}
};

// Hae kaikki asiakkaan tilaukset keskusdivarista ID:n perusteella
export const haeAsiakkaanTilaukset = async (kayttajaId: number) => {
	const tilaukset = await db('keskusdivari.Tilaus as t')
		.select('k.kayttajaId as kayttajaId', 'k.nimi as asiakas_nimi', 't.tilausId', 't.tilauspvm', 't.kokonaishinta', 't.postikulut')
		.join('keskusdivari.Kayttaja as k', 'k.kayttajaId', 't.kayttajaId')
		.where('k.kayttajaId', kayttajaId);

	return tilaukset;
};

// Hae tilauksen instanssit tilauksen ID:n perusteella keskusdivarista
export const haeTilauksenInstanssit = async (tilausId: number) => {
	const instanssit = await db('keskusdivari.TeosInstanssi').where('tilausId', tilausId);
	return instanssit;
};
