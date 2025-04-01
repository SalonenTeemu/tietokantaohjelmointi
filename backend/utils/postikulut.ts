import { haePostitusHinnasto } from '../db/queries/postitusHinnasto';

// Laske postikulut annetun kokonaispainon perusteella
export async function laskePostikulut(paino: number) {
	// Hae postitushinnasto tietokannasta
	const painoluokat = await haePostitusHinnasto();

	// Selvitä suurin painoluokka ja sen hinta
	const suurinLuokka = painoluokat.reduce((max, luokka) => {
		return luokka.paino > max.paino ? luokka : max;
	}, painoluokat[0]);

	const maksimiPaino = suurinLuokka.paino;
	const ylimaaraHinta = parseFloat(suurinLuokka.hinta);

	let painoJaljella = paino;
	let postikulut = 0;

	while (painoJaljella > 0) {
		// Käy läpi painoluokat pienimmästä suurimpaan
		for (const luokka of painoluokat) {
			if (painoJaljella <= luokka.paino) {
				postikulut += parseFloat(luokka.hinta);
				painoJaljella = 0; // Koko tilaus käsitelty
				break;
			}
		}

		// Jos paino ylittää suurimman luokan lisää hinta suurimman luokan mukaan ja vähennä jäljellä olevaa painoa
		if (painoJaljella > 0) {
			postikulut += ylimaaraHinta;
			painoJaljella -= maksimiPaino;
		}
	}

	return postikulut;
}
