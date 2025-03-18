import { Request, Response } from 'express';
import { haeKaikkiLuokanMyynnissaOlevatTeokset } from '../db/queries/teos';

// Hae luokan myynnissä olevat teokset
export const haeLuokanMyynnissaOlevatTeokset = async (req: Request, res: Response) => {
	try {
		const tiedot = await haeKaikkiLuokanMyynnissaOlevatTeokset();
		res.status(200).json({ message: tiedot });
	} catch (error) {
		console.error('Virhe haettaessa luokan kokonaismyyntiä:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

// Hae divarin luokan myynnissä olevat teokset
export const haeDivarinLuokanMyynnissaOlevatTeokset = async (req: Request, res: Response) => {
	try {
		const divariId = parseInt(req.params.divariId);
		if (!divariId || divariId <= 0) {
			res.status(400).json({ message: 'Virheellinen divariId.' });
			return;
		}
		const tiedot = await haeKaikkiLuokanMyynnissaOlevatTeokset(divariId);
		res.status(200).json({ message: tiedot });
	} catch (error) {
		console.error('Virhe haettaessa divarin luokan kokonaismyyntiä:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};
