import { TarkistusTulos } from './types';

const tarkistaEmail = (email: string): boolean => {
	const re = /\S+@\S+.\S+/;
	return re.test(email) && email.length >= 5 && email.length <= 255;
};

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

export const tarkistaKirjautuminen = (email: string, salasana: string): TarkistusTulos => {
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

export const tarkistaRekisteroityminen = (nimi: string, email: string, puhelin: string, osoite: string, salasana: string): TarkistusTulos => {
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
