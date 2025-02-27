import { haePostitusHinnasto } from '../db/queries';

// Laske postikulut annetun kokonaispainon perusteella
export async function laskePostikulut(paino: number) {
	const painoluokat = await haePostitusHinnasto();

	let painoJaljella = paino;
	let postikulut = 0;

	while (painoJaljella > 0) {
		// Käy läpi painoluokat pienimmästä suurimpaan
		for (const luokka of painoluokat) {
			if (painoJaljella <= luokka.paino) {
				postikulut += luokka.hinta;
				painoJaljella = 0; // Koko tilaus käsitelty
				break;
			}
		}

		// Jos paino ylittää suurimman luokan (2000g)
		if (painoJaljella > 0) {
			postikulut += 15.0; // Lisää hinta jokaisesta 2000g osasta
			painoJaljella -= 2000;
		}
	}

	return postikulut;
}
