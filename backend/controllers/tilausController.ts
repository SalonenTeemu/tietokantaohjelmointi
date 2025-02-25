import { Request, Response } from 'express';
import { haeAsiakkaanTilaukset } from '../db/queries';

// Hae asiakkaan tilaukset
export const haeTilaukset = async (req: Request, res: Response) => {
	try {
		const asiakasId = Number(req.params.asiakasId);
		if (!asiakasId) {
			res.status(400).json({ message: 'Virheellinen asiakasId' });
			return;
		}
		const tilaukset = await haeAsiakkaanTilaukset(asiakasId);
		res.status(200).json({ message: tilaukset });
	} catch (error) {
		console.error('Virhe haettaessa tilauksia:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

// Luo uusi tilaus
export const luoTilaus = async (req: Request, res: Response) => {
	try {
		const asiakasId = Number(req.params.asiakasId);
        const tilaus = req.body;
		if (!asiakasId) {
			res.status(400).json({ message: 'Virheellinen asiakasId' });
			return;
		}
        if (!tilaus) {
            res.status(400).json({ message: 'Virheellinen tilaus' });
            return;
        }
        // Tilauslogiikka
	} catch (error) {
		console.error('Virhe luotaessa tilausta:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

