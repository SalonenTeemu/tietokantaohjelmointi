import db from '../knex';
import { Knex } from 'knex';
import { TilausTiedot } from '../../utils/types';

// Hae tilaus
export const haeTilaus = async (tilausId: number) => {
	const tilaus = await db('keskusdivari.Tilaus').where('tilausId', tilausId).first();
	return tilaus;
};

// Lisää uusi tilaus
export const lisaaTilaus = async (tilausTiedot: TilausTiedot, trx: Knex.Transaction) => {
	const formattedTilausTiedot = {
		...tilausTiedot,
		kokonaishinta: tilausTiedot.kokonaishinta,
		postikulut: tilausTiedot.postikulut,
	};

	const tilaus = await db('keskusdivari.Tilaus')
		.insert(formattedTilausTiedot)
		.returning('*')
		.transacting(trx)
		.then((rows) => rows[0]);
	return tilaus;
};

// Päivitys tilauksen tila
export const paivitaTilauksenTila = async (tilausId: number, uusiTila: string, trx?: Knex.Transaction) => {
	if (!trx) {
		await db('keskusdivari.Tilaus').where('tilausId', tilausId).update({ tila: uusiTila });
	} else {
		await db('keskusdivari.Tilaus').where('tilausId', tilausId).update({ tila: uusiTila }).transacting(trx);
	}
};

// Asiakkaan tilaukset
export const haeAsiakkaanTilaukset = async (kayttajaId: number) => {
	const tilaukset = await db('keskusdivari.Tilaus as t')
		.select('k.kayttajaId as kayttajaId', 'k.nimi as asiakas_nimi', 't.tilausId', 't.tilauspvm', 't.kokonaishinta', 't.postikulut')
		.join('keskusdivari.Kayttaja as k', 'k.kayttajaId', 't.kayttajaId')
		.where('k.kayttajaId', kayttajaId);

	return tilaukset;
};

// Hae tilauksen sisätämät instanssit
export const haeTilauksenInstanssit = async (tilausId: number) => {
	const instanssit = await db('keskusdivari.TeosInstanssi').where('tilausId', tilausId);
	return instanssit;
};
