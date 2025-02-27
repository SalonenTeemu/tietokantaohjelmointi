import { Haku } from './types';

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

// Tarkista teoshaun oikeellisuus
export function tarkistaTeosHaku(hakusanat: any): { success: boolean; message?: string; hakusanat?: Haku } {
	const haku = hakusanat as Haku;
	if (!haku.nimi && !haku.tekija && !haku.luokka && !haku.tyyppi) {
		return { success: false, message: 'Ei annettuja hakusanoja.' };
	}
	return { success: true, hakusanat: haku };
}

// Tarksita tilauksen luomisen oikeellisuus
export function tarkistaLuoTilaus(tilaus: any): { success: boolean; message?: string } {
	if (!tilaus.asiakasId) return { success: false, message: 'AsiakasId puuttuu.' };
	if (!tilaus.instanssit || tilaus.instanssit.length === 0) return { success: false, message: 'Tilauksessa ei ole instansseja.' };
	return { success: true };
}
