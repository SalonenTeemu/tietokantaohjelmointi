import { Request, Response } from 'express';
import {
	haeTeoksetHakusanalla,
	haeLuokanMyynnissaOlevatTeokset,
	haeTeoksenInstanssit,
	haeLuokat,
	haeTyypit,
	haeTeosISBNlla,
	lisaaUusiTeos,
} from '../db/queries/teos';
import { Haku } from '../utils/types';
import { tarkistaLuoTeos, tarkistaLuoTeosInstanssi, tarkistaTeosHaku } from '../utils/validate';
import { haeDivariIdlla } from '../db/queries/divari';
import { lisaaUusiTeosInstanssi } from '../db/queries/teosIntanssi';

// Hae teoksia hakusanoilla (nimi, tekijä, luokka, tyyppi)
export const haeTeoksia = async (req: Request, res: Response) => {
	try {
		const hakusanat = req.query;
		const tarkistus = tarkistaTeosHaku(hakusanat as unknown as Haku);
		if (!tarkistus.success) {
			res.status(400).json({ message: tarkistus.message });
			return;
		}
		const teokset = await haeTeoksetHakusanalla(hakusanat);
		res.status(200).json({ message: teokset });
	} catch (error) {
		console.error('Virhe haettaessa teoksia:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

// Hae kaiki mahdolliset luokat
export const haeKaikkiLuokat = async (req: Request, res: Response) => {
	try {
		const luokat = await haeLuokat();
		res.status(200).json({ message: luokat });
	} catch (error) {
		console.error('Virhe haettaessa luokkia:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

// Hae kaikki mahdolliset tyypit
export const haeKaikkiTyypit = async (req: Request, res: Response) => {
	try {
		const tyypit = await haeTyypit();
		res.status(200).json({ message: tyypit });
	} catch (error) {
		console.error('Virhe haettaessa tyyppejä:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

// Hae teoksen instanssit
export const haeTeosInstanssit = async (req: Request, res: Response) => {
	try {
		const teosId = req.params.teosId;
		if (!teosId) {
			res.status(400).json({ message: 'Virheellinen teosId.' });
			return;
		}
		const instanssit = await haeTeoksenInstanssit(teosId);
		res.status(200).json({ message: instanssit });
	} catch (error) {
		console.error('Virhe haettaessa teoksen instansseja:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

// Hae luokan teosten kokonaismyyntihinta ja keskihinta
export const haeLuokanKokonaismyynti = async (req: Request, res: Response) => {
	try {
		const tiedot = await haeLuokanMyynnissaOlevatTeokset();
		res.status(200).json({ message: tiedot });
	} catch (error) {
		console.error('Virhe haettaessa luokan kokonaismyyntiä:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

// Lisää uusi teos
export const lisaaTeos = async (req: Request, res: Response) => {
	try {
		const { isbn, nimi, tekija, julkaisuvuosi, paino, tyyppiId, luokkaId } = req.body;
		const tarkistus = tarkistaLuoTeos(req.body);
		if (!tarkistus.success) {
			res.status(400).json({ message: tarkistus.message });
			return;
		}
		if (isbn) {
			const teos = await haeTeosISBNlla(isbn);
			if (teos) {
				res.status(400).json({ message: 'Teos on jo olemassa.' });
				return;
			}
		}
		await lisaaUusiTeos({ isbn, nimi, tekija, julkaisuvuosi, paino, tyyppiId, luokkaId });
		res.status(201).json({ message: 'Teos lisätty.' });
	} catch (error) {
		console.error('Virhe teoksen lisäämisessä:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

// Lisää uusi instanssi teokselle
export const lisaaTeosInstanssi = async (req: Request, res: Response) => {
	try {
		const teosId = req.params.teosId;
		if (!teosId) {
			res.status(400).json({ message: 'Virheellinen teosId.' });
			return;
		}
		const { hinta, kunto, sisaanostohinta, divariId } = req.body;
		const tarkistus = tarkistaLuoTeosInstanssi(req.body);
		if (!tarkistus.success) {
			res.status(400).json({ message: tarkistus.message });
			return;
		}
		const divari = await haeDivariIdlla(divariId);
		if (!divari) {
			res.status(400).json({ message: 'Annettua divaria ei löydy.' });
			return;
		}
		await lisaaUusiTeosInstanssi({ hinta, kunto, sisaanostohinta, divariId, teosId });
		res.status(201).json({ message: 'TeosInstanssi lisätty.' });
	} catch (error) {
		console.error('Virhe teoksen instanssin lisäämisessä:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};
