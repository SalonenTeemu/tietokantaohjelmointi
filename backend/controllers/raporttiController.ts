import { Request, Response } from 'express';
import { json2csv } from 'json-2-csv';
import { haeKaikkiLuokanMyynnissaOlevatTeokset } from '../db/queries/teos';
import { haeAsiakkaidenViimeVuodenOstot } from '../db/queries/teosInstanssi';

/**
 * Vastaa pyyntöön luokan myynnissä olevista teoksista. Hakee tiedot tietokannasta ja palauttaa ne JSON-muodossa.
 * @returns Onnistuessa luokan myynnissä olevat teokset. Muuten virheviesti.
 */
export const haeLuokanMyynnissaOlevatTeokset = async (req: Request, res: Response) => {
	try {
		// Haetaan luokan myynnissä olevat teokset tietokannasta
		const tiedot = await haeKaikkiLuokanMyynnissaOlevatTeokset();

		// Lasketaan yhteen arvot luokan mukaan
		const aggregatedData = tiedot.reduce((acc, item) => {
			if (!acc[item.luokka]) {
				acc[item.luokka] = {
					luokka: item.luokka,
					lkmMyynnissa: 0,
					lkmTeoksia: 0,
					kokonaisMyyntihinta: 0,
					keskiMyyntihinta: 0,
				};
			}
			acc[item.luokka].lkmMyynnissa += parseInt(item.lkmMyynnissa);
			acc[item.luokka].lkmTeoksia += parseInt(item.lkmTeoksia);

			acc[item.luokka].kokonaisMyyntihinta += parseFloat(item.kokonaisMyyntihinta.replace(/^0+/, ''));

			if (acc[item.luokka].lkmMyynnissa > 0) {
				acc[item.luokka].keskiMyyntihinta = parseFloat((acc[item.luokka].kokonaisMyyntihinta / acc[item.luokka].lkmMyynnissa).toFixed(2));
			} else {
				acc[item.luokka].keskiMyyntihinta = 0;
			}

			return acc;
		}, {});

		// Muotoillaan kokonaisMyyntihinta kahden desimaalin tarkkuudella
		const result = Object.values(aggregatedData).map((item: any) => ({
			...item,
			kokonaisMyyntihinta: item.kokonaisMyyntihinta.toFixed(2),
		}));

		res.status(200).json({ message: result });
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
		const tiedot = await haeKaikkiLuokanMyynnissaOlevatTeokset(divariId);
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
