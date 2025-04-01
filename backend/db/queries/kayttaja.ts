import db from '../knex';

// Hae käyttäjä sähköpostin perusteella keskusdivarista
export const haeKayttajaSahkopostilla = async (email: string) => {
	const kayttaja = await db('keskusdivari.Kayttaja').where('email', email).first();
	return kayttaja;
};

// Hae käyttäjä ID:n perusteella keskusdivarista
export const haeProfiiliIDlla = async (kayttajaId: number) => {
	const kayttaja = await db('keskusdivari.Kayttaja')
		.where('kayttajaId', kayttajaId)
		.select('kayttajaId', 'email', 'nimi', 'osoite', 'puhelin', 'rooli')
		.first();
	return kayttaja;
};

// Hae käyttäjä puhelimen perusteella keskusdivarista
export const haeKayttajaPuhelimella = async (puhelin: string) => {
	const kayttaja = await db('keskusdivari.Kayttaja').where('puhelin', puhelin).first();
	return kayttaja;
};

// Lisää uusi käyttäjä keskusdivariin
export const lisaaKayttaja = async (email: string, salasana: string, nimi: string, osoite: string, puhelin: string) => {
	await db('keskusdivari.Kayttaja').insert({ email, salasana, nimi, osoite, puhelin });
};

// Hae käyttäjän divarin ID keskusdivarista jos käyttäjä on divariAdmin tai admin
export const haeKayttajanDivariId = async (kayttajaId: number) => {
	const kayttaja = await db('keskusdivari.Divari_Admin').where('kayttajaId', kayttajaId).first();
	return kayttaja.divariId;
};

// Hae käyttäjän oma tietokanta keskusdivarista. Palauttaa null, jos käyttäjä ei ole divariAdmin tai ei käytä omaa tietokantaa.
export const haeKayttajanOmaTietokanta = async (kayttajaId: number) => {
	const result = await db('keskusdivari.Divari_Admin as da')
		.join('keskusdivari.Divari as d', 'da.divariId', 'd.divariId')
		.where('da.kayttajaId', kayttajaId)
		.select('d.omaTietokanta')
		.first();
	return result ? result.omaTietokanta : null;
};
