import db from '../knex';

// Käyttäjän haku emaililla
export const haeKayttajaSahkopostilla = async (email: string) => {
	const kayttaja = await db('keskusdivari.Kayttaja').where('email', email).first();
	return kayttaja;
};

// Käyttäjän profiilin haku ID:llä
export const haeProfiiliIDlla = async (kayttajaId: number) => {
	const kayttaja = await db('keskusdivari.Kayttaja')
		.where('kayttajaId', kayttajaId)
		.select('kayttajaId', 'email', 'nimi', 'osoite', 'puhelin', 'rooli')
		.first();
	return kayttaja;
};

// Käyttäjän haku puhelimella
export const haeKayttajaPuhelimella = async (puhelin: string) => {
	const kayttaja = await db('keskusdivari.Kayttaja').where('puhelin', puhelin).first();
	return kayttaja;
};

// Lisää uusi käyttäjä
export const lisaaKayttaja = async (email: string, salasana: string, nimi: string, osoite: string, puhelin: string) => {
	await db('keskusdivari.Kayttaja').insert({ email, salasana, nimi, osoite, puhelin });
};

// Hae käyttäjän divariId
export const haeKayttajanDivariId = async (kayttajaId: number) => {
	const kayttaja = await db('keskusdivari.Divari_Admin').where('kayttajaId', kayttajaId).first();
	return kayttaja.divariId;
};
