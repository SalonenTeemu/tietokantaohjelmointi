import { Request, Response } from 'express';
import db from '../db/knex';
import { haeAsiakkaanTilaukset, lisaaTilaus, haeTilaus, haeTilauksenInstanssit, paivitaTilauksenTila } from '../db/queries/tilaus';
import { haeTeosIdlla } from '../db/queries/teos';
import { haeTeosInstanssi, paivitaTeosInstanssinTila, paivitaTeosInstanssinTilaus, asetaTeosInstanssinMyyntiPvm } from '../db/queries/teosInstanssi';
import { laskePostikulut } from '../utils/postikulut';
import { tarkistaLuoTilaus } from '../utils/validate';

/**
 * Vastaa pyyntöön asiakkaan omista tilauksista. Hakee tiedot tietokannasta ja palauttaa ne JSON-muodossa.
 * @returns Onnistuessa asiakkaan omat tilaukset. Muuten virheviesti.
 */
export const haeTilaukset = async (req: Request, res: Response) => {
	try {
		const { kayttajaId } = req.user as any;
		if (!kayttajaId) {
			res.status(400).json({ message: 'Virheellinen kayttajaId.' });
			return;
		}
		const tilaukset = await haeAsiakkaanTilaukset(kayttajaId);
		res.status(200).json({ message: tilaukset });
	} catch (error) {
		console.error('Virhe haettaessa tilauksia:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

/**
 * Vastaa pyyntöön uuden tilauksen luomisesta. Tarkistaa syötteet ja lisää uuden tilauksen tietokantaan.
 * @returns Onnistuessa viestin tilauksen luomisesta. Muuten virheviesti.
 */
export const luoTilaus = async (req: Request, res: Response) => {
	try {
		const tilaus = req.body;
		// Tarkistetaan, että tilaus sisältää tarvittavat tiedot oikeassa muodossa
		const tarkistus = tarkistaLuoTilaus(tilaus);
		if (!tarkistus.success) {
			res.status(400).json({ message: tarkistus.message });
			return;
		}

		const tilauksenInstanssit: any[] = [];
		// Tarkistetaan, että tilauksen instanssit ovat olemassa ja vapaita. Lisätään ne tilauksenInstanssit-taulukkoon.
		for (const instanssi of tilaus.instanssit) {
			const teosInstanssi = await haeTeosInstanssi(instanssi);
			if (!teosInstanssi) {
				res.status(400).json({ id: instanssi, message: 'TeosInstanssia ei löytynyt.' });
				return;
			}
			if (teosInstanssi.tila === 'varattu' || teosInstanssi.tila === 'myyty') {
				res.status(400).json({ id: instanssi, message: 'TeosInstanssi ei ole vapaa.' });
				return;
			}
			const teos = await haeTeosIdlla(teosInstanssi.teosId);
			if (!teos) {
				res.status(400).json({ id: instanssi, message: 'Instanssin teosta ei löytynyt.' });
				return;
			}
			teosInstanssi.paino = teos.paino;
			tilauksenInstanssit.push(teosInstanssi);
		}

		// Luo uusi tilaus tietokantaan ja päivitetään tilauksen instanssit varatuksi
		const uusiTilaus = await db.transaction(async (trx) => {
			for (const instanssi of tilaus.instanssit) {
				await paivitaTeosInstanssinTila(instanssi, 'varattu', trx);
			}

			// Lasketaan postikulut tilauksen instanssien painon perusteella
			const postikulut = await laskePostikulut(tilauksenInstanssit.reduce((sum: number, instanssi: any) => sum + (instanssi.paino ?? 0), 0));

			const tilausTiedot = {
				kayttajaId: tilaus.kayttajaId,
				tilauspvm: new Date(),
				kokonaishinta: Number(postikulut) + tilauksenInstanssit.reduce((sum: number, instanssi: any) => sum + Number(instanssi.hinta), 0),
				postikulut: postikulut,
			};

			const lisattyTilaus: any = await lisaaTilaus(tilausTiedot, trx);
			// Päivitetään tilauksen instanssien tilausId
			for (const instanssi of tilaus.instanssit) {
				await paivitaTeosInstanssinTilaus(instanssi, lisattyTilaus.tilausId, trx);
			}
			lisattyTilaus.postikulut = parseFloat(lisattyTilaus.postikulut);
			return lisattyTilaus;
		});

		// Jos tilaus on onnistuneesti luotu, palautetaan tilauksen tiedot
		if (uusiTilaus) {
			res.status(201).json({ message: uusiTilaus });
		} else {
			res.status(500).json({ message: 'Virhe luotaessa tilausta.' });
		}
	} catch (error) {
		console.error('Virhe luotaessa tilausta:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

/**
 * Vastaa pyyntöön tilauksen vahvistamisesta. Tarkistaa tilauksen tilan ja päivittää sen tilan tietokannassa.
 * @returns Onnistuessa viestin tilauksen vahvistamisesta. Muuten virheviesti.
 */
export const vahvistaTilaus = async (req: Request, res: Response) => {
	try {
		// Tarkistetaan, että tilausId on annettu
		const tilausId = Number(req.params.tilausId);
		if (!tilausId) {
			res.status(400).json({ message: 'Virheellinen tilausId.' });
			return;
		}

		// Hae tilaus tietokannasta
		const tilaus = await haeTilaus(tilausId);
		if (!tilaus) {
			res.status(400).json({ message: 'Tilausta ei löytynyt.' });
			return;
		}

		// Tarkista, että tilauksen tila on kesken
		if (tilaus.tila !== 'kesken') {
			res.status(400).json({ message: 'Tilaus on jo vahvistettu tai peruutettu.' });
			return;
		}

		// Hae tilauksen instanssit tietokannasta
		const instannsit = await haeTilauksenInstanssit(tilausId);
		if (!instannsit || instannsit.length === 0) {
			res.status(400).json({ message: 'Tilauksella ei ole instansseja.' });
			return;
		}

		// Tarkista, että kaikki tilauksen instanssit ovat varattu
		for (const instanssi of instannsit) {
			if (instanssi.tila !== 'varattu') {
				res.status(400).json({ message: 'Tilauksella on instansseja, jotka eivät ole varattu.' });
				return;
			}
		}

		// Vahvista tilaus ja päivitä instanssien tila myydyksi
		const vahvistettuTilaus = await db.transaction(async (trx) => {
			for (const instanssi of instannsit) {
				await paivitaTeosInstanssinTila(instanssi.teosInstanssiId, 'myyty', trx);
				await asetaTeosInstanssinMyyntiPvm(instanssi.teosInstanssiId, new Date(), trx);
			}

			await paivitaTilauksenTila(tilausId, 'valmis', trx);
			return true;
		});

		if (vahvistettuTilaus) {
			res.status(200).json({ message: 'Tilaus vahvistettu.' });
		} else {
			res.status(500).json({ message: 'Virhe vahvistaessa tilausta.' });
		}
	} catch (error) {
		console.error('Virhe vahvistaessa tilausta:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

/**
 * Vastaa pyyntöön tilauksen peruuttamisesta. Tarkistaa tilauksen tilan ja päivittää sen tilan tietokannassa.
 * @returns Onnistuessa viestin tilauksen peruuttamisesta. Muuten virheviesti.
 */
export const peruutaTilaus = async (req: Request, res: Response) => {
	try {
		// Tarkistetaan, että tilausId on annettu
		const tilausId = Number(req.params.tilausId);
		if (!tilausId) {
			res.status(400).json({ message: 'Virheellinen tilausId.' });
			return;
		}

		// Hae tilaus tietokannasta
		const tilaus = await haeTilaus(tilausId);
		if (!tilaus) {
			res.status(400).json({ message: 'Tilausta ei löytynyt.' });
			return;
		}

		// Tarkista, että tilauksen tila on kesken
		if (tilaus.tila !== 'kesken') {
			res.status(400).json({ message: 'Tilaus on jo vahvistettu tai peruutettu.' });
			return;
		}

		// Hae tilauksen instanssit tietokannasta
		const instanssit = await haeTilauksenInstanssit(tilausId);
		if (!instanssit || instanssit.length === 0) {
			await paivitaTilauksenTila(tilausId, 'peruutettu');
			res.status(400).json({ message: 'Tilauksella ei ole instansseja.' });
			return;
		}

		// Peruutetaan tilaus ja päivitetään instanssien tila ostoskoriin
		const peruutettuTilaus = await db.transaction(async (trx) => {
			for (const instanssi of instanssit) {
				await paivitaTeosInstanssinTila(instanssi.teosInstanssiId, 'ostoskorissa', trx);
				await paivitaTeosInstanssinTilaus(instanssi.teosInstanssiId, null, trx);
			}

			await paivitaTilauksenTila(tilausId, 'peruutettu', trx);
			return true;
		});

		if (peruutettuTilaus) {
			res.status(200).json({ message: 'Tilaus peruutettu.' });
		} else {
			res.status(500).json({ message: 'Virhe peruuttaessa tilausta.' });
		}
	} catch (error) {
		console.error('Virhe peruuttaessa tilausta:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};
