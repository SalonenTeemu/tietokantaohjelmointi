// Tarkista sähköpostin oikeellisuus
function tarkistaEmail(email: string): boolean {
	const re = /\S+@\S+\.\S+/;
	return re.test(email) && email.length <= 255;
}

// Tarkista salasanan oikeellisuus
function tarkistaSalasana(salasana: string): boolean {
	return salasana.length >= 4 && salasana.length <= 100;
}

// Tarkista nimen oikeellisuus
function tarkistaNimi(nimi: string): boolean {
	return nimi.length >= 2 && nimi.length <= 100;
}

// Tarkista osoitteen oikeellisuus
function tarkistaOsoite(osoite: string): boolean {
	return osoite.length >= 5 && osoite.length <= 255;
}

// Tarkista puhelinnumeron oikeellisuus
function tarkistaPuhelin(puhelin: string): boolean {
	const re = /^[0-9]{9,20}$/;
	return re.test(puhelin);
}

// Tarkista kirjautumisessa annettujen tietojen oikeellisuus
export function tarkistaKirjautuminen(email: string, salasana: string): { success: boolean; message?: string } {
	if (!email || !salasana) {
		return { success: false, message: 'Käyttäjätunnus ja salasana vaaditaan.' };
	}
	if (!tarkistaEmail(email)) {
		return { success: false, message: 'Sähköposti ei ole kelvollinen.' };
	}
	if (!tarkistaSalasana(salasana)) {
		return { success: false, message: 'Salasana ei ole kelvollinen. Salasanan tulee olla 4-100 merkkiä pitkä.' };
	}
	return { success: true };
}

// Tarkista rekisteröitymisessä annettujen tietojen oikeellisuus
export function tarkistaRekisteroityminen(
	email: string,
	salasana: string,
	nimi: string,
	osoite: string,
	puhelin: string
): { success: boolean; message?: string } {
	if (!email || !salasana || !nimi || !osoite || !puhelin) {
		return { success: false, message: 'Kaikki tiedot vaaditaan.' };
	}
	if (!tarkistaEmail(email)) {
		return { success: false, message: 'Sähköposti ei ole kelvollinen.' };
	}
	if (!tarkistaSalasana(salasana)) {
		return { success: false, message: 'Salasana ei ole kelvollinen. Salasanan tulee olla 4-100 merkkiä pitkä.' };
	}
	if (!tarkistaNimi(nimi)) {
		return { success: false, message: 'Nimi ei ole kelvollinen. Nimen tulee olla 2-100 merkkiä pitkä.' };
	}
	if (!tarkistaOsoite(osoite)) {
		return { success: false, message: 'Osoite ei ole kelvollinen. Osoitteen tulee olla 5-255 merkkiä pitkä.' };
	}
	if (!tarkistaPuhelin(puhelin)) {
		return { success: false, message: 'Puhelinnumero ei ole kelvollinen.' };
	}
	return { success: true };
}

// Tarkista ISBN:n oikeellisuus
export function tarkistaISBN(isbn: string): boolean {
	const re = /^[0-9]{10,20}$/;
	return re.test(isbn);
}

// Tarkista julkaisuvuoden oikeellisuus
export function tarkistaJulkaisuvuosi(julkaisuvuosi: number): boolean {
	return julkaisuvuosi >= 0 && julkaisuvuosi <= new Date().getFullYear();
}

// Tarkista teoksen luomisen oikeellisuus
export function tarkistaLuoTeos(teos: any): { success: boolean; message?: string } {
	if (!teos.nimi || !teos.tekija || !teos.julkaisuvuosi || !teos.paino || !teos.tyyppiId || !teos.luokkaId) {
		return { success: false, message: 'Kaikki tiedot vaaditaan.' };
	}
	if (!tarkistaNimi(teos.nimi)) {
		return { success: false, message: 'Nimi ei ole kelvollinen. Nimen tulee olla 2-100 merkkiä pitkä.' };
	}
	if (teos.isbn && !tarkistaISBN(teos.isbn)) {
		return { success: false, message: 'ISBN ei ole kelvollinen.' };
	}
	if (!tarkistaNimi(teos.tekija)) {
		return { success: false, message: 'Tekijä ei ole kelvollinen. Tekijän tulee olla 2-100 merkkiä pitkä.' };
	}
	if (!tarkistaJulkaisuvuosi(teos.julkaisuvuosi)) {
		return { success: false, message: 'Julkaisuvuosi ei ole kelvollinen.' };
	}
	if (teos.paino < 0) {
		return { success: false, message: 'Paino ei ole kelvollinen.' };
	}
	if (teos.tyyppiId <= 0 || teos.luokkaId <= 0) {
		return { success: false, message: 'Tyyppi tai luokka ei ole kelvollinen.' };
	}
	return { success: true };
}

// Tarkista teoshaun oikeellisuus
export function tarkistaTeosHaku(haku: any): { success: boolean; message?: string; hakusanat?: any } {
	if (!haku.nimi && !haku.tekija && !haku.luokka && !haku.tyyppi) {
		return { success: false, message: 'Ei annettuja hakusanoja.' };
	}
	return { success: true, hakusanat: haku };
}

// Tarkista teosInstanssin luomisen oikeellisuus
export const tarkistaLuoTeosInstanssi = (instanssi: any, kpl: number): { success: boolean; message?: string } => {
	if (instanssi.hinta == null || instanssi.divariId == null || kpl == null) {
		return { success: false, message: 'Hinta, kappalemäärä ja divariId vaaditaan.' };
	}
	if (instanssi.hinta <= 0) {
		return { success: false, message: 'Hinta ei ole kelvollinen.' };
	}
	if (kpl <= 0 || kpl > 100) {
		return { success: false, message: 'Kappalemäärä ei ole kelvollinen. Kappalemäärän tulee olla 1-100.' };
	}
	if (instanssi.kunto && !['heikko', 'kohtalainen', 'erinomainen'].includes(instanssi.kunto)) {
		return { success: false, message: 'Kunto ei ole kelvollinen.' };
	}
	if (instanssi.sisaanostohinta != null && instanssi.sisaanostohinta <= 0) {
		return { success: false, message: 'Sisäänostohinta ei ole kelvollinen.' };
	}
	if (instanssi.divariId <= 0) {
		return { success: false, message: 'DivariId ei ole kelvollinen.' };
	}
	return { success: true };
};

// Tarkista tilauksen luomisen oikeellisuus
export function tarkistaLuoTilaus(tilaus: any): { success: boolean; message?: string } {
	if (!tilaus.kayttajaId) return { success: false, message: 'KayttajaId puuttuu.' };
	if (!tilaus.instanssit || !Array.isArray(tilaus.instanssit) || tilaus.instanssit.length === 0)
		return { success: false, message: 'Tilauksessa ei ole instansseja.' };
	return { success: true };
}
