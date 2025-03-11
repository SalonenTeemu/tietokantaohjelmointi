// Esittää käyttäjän tietoja
export interface Kayttaja {
	kayttajaId: number;
	nimi: string;
	osoite: string;
	puhelin: string;
	email: string;
	rooli: string;
	divariId?: number;
}
