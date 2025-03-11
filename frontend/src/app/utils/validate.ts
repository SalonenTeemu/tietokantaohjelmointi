// Tarkista sähköpostin oikeellisuus
const tarkistaEmail = (email: string): boolean => {
	const re = /\S+@\S+.\S+/;
	return re.test(email) && email.length >= 5 && email.length <= 255;
};

// Tarkista ISBN:n oikeellisuus
export function tarkistaISBN(isbn: string): boolean {
	const re = /^[0-9]{10,20}$/;
	return re.test(isbn);
}

const tarkistaSalasana = (salasana: string): boolean => {
	return salasana.length >= 4 && salasana.length <= 100;
};

const tarkistaNimi = (nimi: string): boolean => {
	return nimi.length >= 2 && nimi.length <= 100;
};

const tarkistaPuhelin = (puhelin: string): boolean => {
	const re = /^[0-9]{9,20}$/;
	return re.test(puhelin) && puhelin.length >= 5 && puhelin.length <= 20;
};

const tarkistaOsoite = (osoite: string): boolean => {
	return osoite.length >= 5 && osoite.length <= 255;
};

export const tarkistaKirjautuminen = (email: string, salasana: string): any => {
	if (!email || !salasana) {
		return { success: false, message: 'Sähköposti ja salasana ovat pakollisia' };
	}
	if (!tarkistaEmail(email)) {
		return { success: false, message: 'Virheellinen sähköposti' };
	}
	if (!tarkistaSalasana(salasana)) {
		return { success: false, message: 'Virheellinen salasana: pituus oltava 4-100 merkkiä' };
	}
	return { success: true, message: '' };
};

export const tarkistaRekisteroityminen = (nimi: string, email: string, puhelin: string, osoite: string, salasana: string): any => {
	if (!nimi || !email || !puhelin || !osoite || !salasana) {
		return { success: false, message: 'Kaikki kentät ovat pakollisia' };
	}
	if (!tarkistaNimi(nimi)) {
		return { success: false, message: 'Virheellinen nimi: pituus oltava 2-100 merkkiä' };
	}
	if (!tarkistaEmail(email)) {
		return { success: false, message: 'Virheellinen sähköposti' };
	}
	if (!tarkistaPuhelin(puhelin)) {
		return { success: false, message: 'Virheellinen puhelinnumero' };
	}
	if (!tarkistaOsoite(osoite)) {
		return { success: false, message: 'Virheellinen osoite' };
	}
	if (!tarkistaSalasana(salasana)) {
		return { success: false, message: 'Virheellinen salasana: pituus oltava 4-100 merkkiä' };
	}
	return { success: true, message: '' };
};

export const tarkistaHaku = (nimi: string, tekija: string, luokka: string, tyyppi: string): boolean => {
	if (!nimi && !tekija && !luokka && !tyyppi) {
		return false;
	}
	return true;
};

export const tarkistaTeoksenLisäys = (
	nimi: string,
	isbn: string,
	tekija: string,
	tyyppi: string,
	luokka: string,
	julkaisuvuosi: number,
	paino: number
): any => {
	if (!nimi || !tekija || !tyyppi || !luokka || !julkaisuvuosi || !paino) {
		return { success: false, message: 'Kaikki muut kentät kuin ISBN ovat pakollisia' };
	}
	if (!tarkistaNimi(nimi)) {
		return { success: false, message: 'Virheellinen nimi: pituus oltava 2-100 merkkiä' };
	}
	if (isbn && !tarkistaISBN(isbn)) {
		return { success: false, message: 'ISBN-numero ei kelpaa' };
	}
	if (!tarkistaNimi(tekija)) {
		return { success: false, message: 'Virheellinen tekijä: pituus oltava 2-100 merkkiä' };
	}
	if (julkaisuvuosi < 0 || julkaisuvuosi > Number(new Date().getFullYear())) {
		return { success: false, message: 'Virheellinen julkaisuvuosi' };
	}
	if (paino < 0) {
		return { success: false, message: 'Virheellinen paino: painon tulee olla yli 0g' };
	}
	return { success: true, message: '' };
};

export const tarkistaInstanssiLisäys = (instanssi: any): { success: boolean; message?: string } => {
	if (instanssi.hinta == null || instanssi.divariId == null || instanssi.kpl == null) {
		return { success: false, message: 'Hinta ja kappalemäärä vaaditaan.' };
	}
	if (instanssi.hinta <= 0) {
		return { success: false, message: 'Hinta ei ole kelvollinen.' };
	}
	if (instanssi.kpl <= 0 || instanssi.kpl > 100) {
		return { success: false, message: 'Kappalemäärä ei ole kelvollinen. Kappalemäärän tulee olla 1-100.' };
	}
	if (instanssi.kunto && !['heikko', 'kohtalainen', 'erinomainen'].includes(instanssi.kunto)) {
		return { success: false, message: 'Kunto ei ole kelvollinen.' };
	}
	if (instanssi.sisaanostohinta && instanssi.sisaanostohinta < 0) {
		return { success: false, message: 'Sisäänostohinta ei ole kelvollinen.' };
	}
	if (instanssi.divariId <= 0) {
		return { success: false, message: 'DivariId ei ole kelvollinen.' };
	}
	return { success: true };
};
