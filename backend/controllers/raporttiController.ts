import { Request, Response } from 'express';
import { json2csv } from 'json-2-csv';
import { haeKaikkiLuokanMyynnissaOlevatTeokset } from '../db/queries/teos';
import { haeAsiakkaidenViimeVuodenOstot } from '../db/queries/teosInstanssi';

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

// Hae asiakasraportti viime vuodelta CSV-muodossa
export const haeAsiakasRaporttiViimeVuosi = async (req: Request, res: Response) => {
	try {
		const raportti = await haeAsiakkaidenViimeVuodenOstot();
		if (!raportti) {
			res.status(404).json({ message: 'Raporttia ei saatu muodostettua.' });
			return;
		}
		const fields = ['kayttajaId', 'nimi', 'email', 'ostettujenTeostenLkm'];
		const opts = { delimiter: { field: ';' }, keys: fields };
		const csv = await json2csv(raportti, opts);
		res.header('Content-Type', 'text/csv');
		res.attachment('asiakasraportti_viime_vuosi.csv');
		res.send(csv);
	} catch (error) {
		console.error('Virhe haettaessa asiakasraporttia viime vuodelta:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};
