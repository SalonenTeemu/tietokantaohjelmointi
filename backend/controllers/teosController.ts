import { Request, Response } from 'express';
import { haeTeoksetHakusanalla, haeLuokanMyynnissaOlevatTeokset, haeTeoksenInstanssit } from '../db/queries';

export interface Haku {
	nimi: string | null;
	tekija: string | null;
	luokka: string | null;
	tyyppi: string | null;
}

// Hae teoksia hakusanoilla (nimi, tekijä, luokka, tyyppi)
export const haeTeoksia = async (req: Request, res: Response) => {
	try {
		const hakusanat = req.query as unknown as Haku;
		if (!hakusanat.nimi && !hakusanat.tekija && !hakusanat.luokka && !hakusanat.tyyppi) {
			res.status(400).json({ message: 'Ei hakusanoja' });
			return;
		}
		const teokset = await haeTeoksetHakusanalla(hakusanat);
		res.status(200).json({ message: teokset });
	} catch (error) {
		console.error('Virhe haettaessa teoksia:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

// Hae teoksen instanssit
export const haeTeosInstanssit = async (req: Request, res: Response) => {
	try {
		const teosId = req.params.teosId;
		if (!teosId) {
			res.status(400).json({ message: 'Virheellinen teosId' });
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
