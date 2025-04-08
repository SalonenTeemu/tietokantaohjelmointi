import { Request, Response } from 'express';
import { json2csv } from 'json-2-csv';
import { haeLuokanMyynnissaOlevatTeoksetDivari, haeLuokanMyynnissaOlevatTeoksetKeskusdivari } from '../db/queries/teos';
import { haeAsiakkaidenViimeVuodenOstot } from '../db/queries/teosInstanssi';

/**
 * Vastaa pyyntöön luokan myynnissä olevista teoksista keskusdivarissa. Hakee tiedot tietokannasta ja palauttaa ne JSON-muodossa.
 * @returns Onnistuessa luokan myynnissä olevat teokset. Muuten virheviesti.
 */
export const haeLuokanMyynnissaOlevatTeokset = async (req: Request, res: Response) => {
	try {
		// Haetaan luokan myynnissä olevat teokset tietokannasta
		const tiedot = await haeLuokanMyynnissaOlevatTeoksetKeskusdivari();
		res.status(200).json({ message: tiedot });
	} catch (error) {
		console.error('Virhe haettaessa luokan kokonaismyyntiä:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

/**
 * Vastaa pyyntöön divarin luokan myynnissä olevista teoksista. Hakee tiedot tietokannasta ja palauttaa ne JSON-muodossa.
 * @returns Onnistuessa divarin luokan myynnissä olevat teokset. Muuten virheviesti.
 */
export const haeDivarinLuokanMyynnissaOlevatTeokset = async (req: Request, res: Response) => {
	try {
		// Tarkistetaan, että divariId on annettu ja se on positiivinen kokonaisluku
		const divariId = parseInt(req.params.divariId);
		if (!divariId || divariId <= 0) {
			res.status(400).json({ message: 'Virheellinen divariId.' });
			return;
		}
		// Haetaan divarin luokan myynnissä olevat teokset tietokannasta ja palautetaan ne JSON-muodossa
		const tiedot = await haeLuokanMyynnissaOlevatTeoksetDivari(divariId);
		res.status(200).json({ message: tiedot });
	} catch (error) {
		console.error('Virhe haettaessa divarin luokan kokonaismyyntiä:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

/**
 * Vastaa pyyntöön asiakasraportista viime vuodelta. Hakee tiedot tietokannasta ja palauttaa ne CSV-muodossa.
 * @returns Onnistuessa CSV-asiakasraportti viime vuodelta. Muuten virheviesti.
 */
export const haeAsiakasRaporttiViimeVuosi = async (req: Request, res: Response) => {
	try {
		// Haetaan asiakasraportti viime vuodelta tietokannasta
		const raportti = await haeAsiakkaidenViimeVuodenOstot();
		if (!raportti) {
			res.status(404).json({ message: 'Raporttia ei saatu muodostettua.' });
			return;
		}
		// Asetetaan CSV-tiedoston otsikot ja kentät
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
