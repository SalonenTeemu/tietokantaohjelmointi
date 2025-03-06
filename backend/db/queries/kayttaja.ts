import db from '../knex';

// Käyttäjän haku emaililla
export const haeKayttajaSahkopostilla = async (email: string) => {
	const kayttaja = await db('keskusdivari.Kayttaja').where('email', email).first();
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
