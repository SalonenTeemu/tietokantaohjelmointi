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
	const rawTilaukset = await db('keskusdivari.Tilaus as t')
		.select(
			't.tilausId',
			't.tilauspvm',
			't.kokonaishinta',
			't.postikulut',
			't.tila',
			'k.kayttajaId',
			'ti.teosInstanssiId',
			'ti.hinta as instanssi_hinta',
			'ti.kunto as instanssi_kunto',
			'ti.tila as instanssi_tila',
			'te.teosId',
			'te.nimi as teos_nimi',
			'te.tekija as teos_tekija',
			'te.isbn as teos_isbn',
			'te.julkaisuvuosi as teos_julkaisuvuosi'
		)
		.join('keskusdivari.Kayttaja as k', 'k.kayttajaId', 't.kayttajaId')
		.join('keskusdivari.TeosInstanssi as ti', 'ti.tilausId', 't.tilausId')
		.join('keskusdivari.Teos as te', 'te.teosId', 'ti.teosId')
		.where('k.kayttajaId', kayttajaId)
		.where('t.tila', 'valmis');

	// Ryhmitellään tulokset tilauksen mukaan
	const tilaukset = rawTilaukset.reduce((acc: any[], row) => {
		// Etsi, onko tilaus jo lisätty
		let tilaus = acc.find((t) => t.tilausId === row.tilausId);
		if (!tilaus) {
			// Jos tilausta ei ole, luodaan uusi
			tilaus = {
				tilausId: row.tilausId,
				tilauspvm: row.tilauspvm,
				kokonaishinta: row.kokonaishinta,
				postikulut: row.postikulut,
				tila: row.tila,
				kayttajaId: row.kayttajaId,
				asiakas_nimi: row.asiakas_nimi,
				instanssit: [],
			};
			acc.push(tilaus);
		}

		// Lisätään TeosInstanssi tilaukseen
		tilaus.instanssit.push({
			teosInstanssiId: row.teosInstanssiId,
			hinta: row.instanssi_hinta,
			kunto: row.instanssi_kunto,
			tila: row.instanssi_tila,
			myyntipvm: row.myyntipvm,
			teos: {
				teosId: row.teosId,
				nimi: row.teos_nimi,
				tekija: row.teos_tekija,
				isbn: row.teos_isbn,
				julkaisuvuosi: row.teos_julkaisuvuosi,
				paino: row.teos_paino,
			},
		});

		return acc;
	}, []);

	return tilaukset;
};

// Hae tilauksen instanssit tilauksen ID:n perusteella keskusdivarista
export const haeTilauksenInstanssit = async (tilausId: number) => {
	const instanssit = await db('keskusdivari.TeosInstanssi').where('tilausId', tilausId);
	return instanssit;
};
