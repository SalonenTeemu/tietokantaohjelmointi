import { Request, Response } from 'express';
import {
	haeTeoksetHakusanalla,
	haeTeoksenInstanssit,
	haeLuokat,
	haeTyypit,
	haeTeosISBNlla,
	lisaaUusiTeos,
	haeDivarinMyymatTeokset,
	haeTeokset,
} from '../db/queries/teos';
import { tarkistaLuoTeos, tarkistaLuoTeosInstanssi, tarkistaTeosHaku } from '../utils/validate';
import { haeDivariIdlla } from '../db/queries/divari';
import { lisaaUusiTeosInstanssi } from '../db/queries/teosInstanssi';

// Hae kaikki teokset
export const haeKaikkiTeokset = async (req: Request, res: Response) => {
	try {
		const teokset = await haeTeokset();
		res.status(200).json({ message: teokset });
	} catch (error) {
		console.error('Virhe haettaessa teoksia:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

// Hae teoksia hakusanoilla (nimi, tekijä, luokka, tyyppi)
export const haeTeoksia = async (req: Request, res: Response) => {
	try {
		const hakusanat = req.query;
		const tarkistus = tarkistaTeosHaku(hakusanat);
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

// Hae divarin myymät teokset
export const haeDivarinTeokset = async (req: Request, res: Response) => {
	try {
		const divariId = req.params.divariId;
		const divariIdNum = Number(divariId);
		if (!divariId || divariIdNum <= 0) {
			res.status(400).json({ message: 'Virheellinen divariId.' });
			return;
		}
		const teokset = await haeDivarinMyymatTeokset(divariIdNum);
		res.status(200).json({ message: teokset });
	} catch (error) {
		console.error('Virhe haettaessa divarin teoksia:', error);
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
		const { kpl, hinta, kunto, sisaanostohinta, divariId } = req.body;
		const tarkistus = tarkistaLuoTeosInstanssi(req.body, kpl);
		if (!tarkistus.success) {
			res.status(400).json({ message: tarkistus.message });
			return;
		}
		const divari = await haeDivariIdlla(divariId);
		if (!divari) {
			res.status(400).json({ message: 'Annettua divaria ei löydy.' });
			return;
		}
		for (let i = 0; i < kpl; i++) {
			await lisaaUusiTeosInstanssi({ hinta, kunto, sisaanostohinta, divariId, teosId });
		}
		res.status(201).json({ message: 'TeosInstanssi lisätty.' });
	} catch (error) {
		console.error('Virhe teoksen instanssin lisäämisessä:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};
