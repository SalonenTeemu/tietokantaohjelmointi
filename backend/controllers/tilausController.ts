import { Request, Response } from 'express';
import db from '../db/knex';
import { haeAsiakkaanTilaukset, lisaaTilaus, haeTilaus, haeTilauksenInstanssit, paivitaTilauksenTila } from '../db/queries/tilaus';
import { haeTeosIdlla } from '../db/queries/teos';
import { haeTeosInstanssi, paivitaTeosInstanssinTila, paivitaTeosInstanssinTilaus, asetaTeosInstanssinMyyntiPvm } from '../db/queries/teosIntanssi';
import { laskePostikulut } from '../utils/postikulut';
import { tarkistaLuoTilaus } from '../utils/validate';
import { LisattyTilaus, TeosInstanssi } from '../utils/types';

// Hae asiakkaan tilaukset
export const haeTilaukset = async (req: Request, res: Response) => {
	try {
		const kayttajaId = Number(req.params.kayttajaId);
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

// Luo uusi tilaus
export const luoTilaus = async (req: Request, res: Response) => {
	try {
		const tilaus = req.body;
		const tarkistus = tarkistaLuoTilaus(tilaus);
		if (!tarkistus.success) {
			res.status(400).json({ message: tarkistus.message });
			return;
		}

		const tilauksenInstanssit: TeosInstanssi[] = [];
		for (const instanssi of tilaus.instanssit) {
			const teosInstanssi = await haeTeosInstanssi(instanssi);
			if (!teosInstanssi) {
				res.status(400).json({ id: instanssi, message: 'TeosInstanssia ei löytynyt.' });
				return;
			}
			if (teosInstanssi.tila !== 'vapaa') {
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

		const uusiTilaus = await db.transaction(async (trx) => {
			for (const instanssi of tilaus.instanssit) {
				await paivitaTeosInstanssinTila(instanssi, 'varattu', trx);
			}

			const postikulut = await laskePostikulut(
				tilauksenInstanssit.reduce((sum: number, instanssi: TeosInstanssi) => sum + (instanssi.paino ?? 0), 0)
			);

			const tilausTiedot = {
				kayttajaId: tilaus.kayttajaId,
				tilauspvm: new Date(),
				kokonaishinta:
					Number(postikulut) + tilauksenInstanssit.reduce((sum: number, instanssi: TeosInstanssi) => sum + Number(instanssi.hinta), 0),
				postikulut: Number(postikulut),
			};

			const lisattyTilaus: LisattyTilaus = await lisaaTilaus(tilausTiedot, trx);
			for (const instanssi of tilaus.instanssit) {
				await paivitaTeosInstanssinTilaus(instanssi, lisattyTilaus.tilausId, trx);
			}
			return lisattyTilaus;
		});

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

// Vahvista kesken oleva tilaus
export const vahvistaTilaus = async (req: Request, res: Response) => {
	try {
		const tilausId = Number(req.params.tilausId);
		if (!tilausId) {
			res.status(400).json({ message: 'Virheellinen tilausId.' });
			return;
		}

		const tilaus = await haeTilaus(tilausId);
		if (!tilaus) {
			res.status(400).json({ message: 'Tilausta ei löytynyt.' });
			return;
		}

		if (tilaus.tila !== 'kesken') {
			res.status(400).json({ message: 'Tilaus on jo vahvistettu tai peruutettu.' });
			return;
		}

		const instannsit = await haeTilauksenInstanssit(tilausId);
		if (!instannsit || instannsit.length === 0) {
			res.status(400).json({ message: 'Tilauksella ei ole instansseja.' });
			return;
		}

		for (const instanssi of instannsit) {
			if (instanssi.tila !== 'varattu') {
				res.status(400).json({ message: 'Tilauksella on instansseja, jotka eivät ole varattu.' });
				return;
			}
		}

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

// Peruuta kesken oleva tilaus
export const peruutaTilaus = async (req: Request, res: Response) => {
	try {
		const tilausId = Number(req.params.tilausId);
		if (!tilausId) {
			res.status(400).json({ message: 'Virheellinen tilausId.' });
			return;
		}

		const tilaus = await haeTilaus(tilausId);
		if (!tilaus) {
			res.status(400).json({ message: 'Tilausta ei löytynyt.' });
			return;
		}

		if (tilaus.tila !== 'kesken') {
			res.status(400).json({ message: 'Tilaus on jo vahvistettu tai peruutettu.' });
			return;
		}

		const instannsit = await haeTilauksenInstanssit(tilausId);
		if (!instannsit || instannsit.length === 0) {
			await paivitaTilauksenTila(tilausId, 'peruutettu');
			res.status(400).json({ message: 'Tilauksella ei ole instansseja.' });
			return;
		}

		const peruutettuTilaus = await db.transaction(async (trx) => {
			for (const instanssi of instannsit) {
				await paivitaTeosInstanssinTila(instanssi.teosInstanssiId, 'vapaa', trx);
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
