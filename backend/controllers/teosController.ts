import { Request, Response } from 'express';
import {
	haeTeoksetHakusanalla,
	haeTeoksenVapaatInstanssit,
	haeLuokat,
	haeTyypit,
	haeTeosISBNlla,
	lisaaUusiTeos,
	haeDivarinMyymatTeokset,
	haeTeokset,
	haeTeosTekijanJaNimenPerusteella,
} from '../db/queries/teos';
import { tarkistaLuoTeos, tarkistaLuoTeosInstanssi, tarkistaTeosHaku } from '../utils/validate';
import { haeDivariIdlla } from '../db/queries/divari';
import {
	lisaaUusiTeosInstanssi,
	asetaTeosInstanssiOstoskoriin,
	asetaTeosInstanssiVapaaksi,
	haeTeosInstanssi,
	haeVapaaTeosInstanssi,
} from '../db/queries/teosInstanssi';
import { haeKayttajanOmaTietokanta } from '../db/queries/kayttaja';

/**
 * Vastaa pyyntöön kaikkien teosten hausta. Hakee tiedot tietokannasta ja palauttaa ne JSON-muodossa.
 * @returns Onnistuessa kaikki teokset. Muuten virheviesti.
 */
export const haeKaikkiTeokset = async (req: Request, res: Response) => {
	try {
		const teokset = await haeTeokset();
		res.status(200).json({ message: teokset });
	} catch (error) {
		console.error('Virhe haettaessa teoksia:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

/**
 * Vastaa pyyntöön teosten hakemisesta hakusanojen perusteella. Hakee tiedot tietokannasta ja palauttaa ne JSON-muodossa.
 * @returns Onnistuessa teokset hakusanojen perusteella. Muuten virheviesti.
 */
export const haeTeoksia = async (req: Request, res: Response) => {
	try {
		const hakusanat = req.query;
		// Tarkistetaan, että hakusanat ovat oikeanlaisia
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

/**
 * Vastaa pyyntöön divarin teosten hakemisesta. Hakee tiedot tietokannasta ja palauttaa ne JSON-muodossa.
 * @returns Onnistuessa divarin teokset. Muuten virheviesti.
 */
export const haeDivarinTeokset = async (req: Request, res: Response) => {
	try {
		const divariId = req.params.divariId;
		const divariIdNum = Number(divariId);
		// Tarkistetaan, että divariId on annettu ja se on positiivinen kokonaisluku
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

/**
 * Vastaa pyyntöön hakea kaikki luokat. Hakee tiedot tietokannasta ja palauttaa ne JSON-muodossa.
 * @returns Onnistuessa kaikki luokat. Muuten virheviesti.
 */
export const haeKaikkiLuokat = async (req: Request, res: Response) => {
	try {
		const luokat = await haeLuokat();
		res.status(200).json({ message: luokat });
	} catch (error) {
		console.error('Virhe haettaessa luokkia:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

/**
 * Vastaa pyyntöön hakea kaikki tyypit. Hakee tiedot tietokannasta ja palauttaa ne JSON-muodossa.
 * @returns Onnistuessa kaikki tyypit. Muuten virheviesti.
 */
export const haeKaikkiTyypit = async (req: Request, res: Response) => {
	try {
		const tyypit = await haeTyypit();
		res.status(200).json({ message: tyypit });
	} catch (error) {
		console.error('Virhe haettaessa tyyppejä:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

/**
 * Vastaa pyyntöön hakea teoksen instanssit teosId:n perusteella. Hakee tiedot tietokannasta ja palauttaa ne JSON-muodossa.
 * @returns Onnistuessa teoksen instanssit. Muuten virheviesti.
 */
export const haeTeosInstanssit = async (req: Request, res: Response) => {
	try {
		const teosId = req.params.teosId;
		if (!teosId) {
			res.status(400).json({ message: 'Virheellinen teosId.' });
			return;
		}
		const instanssit = await haeTeoksenVapaatInstanssit(teosId);
		res.status(200).json({ message: instanssit });
	} catch (error) {
		console.error('Virhe haettaessa teoksen instansseja:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

/**
 * Vastaa pyyntöön lisätä uusi teos. Tarkistaa, että teos ei ole jo olemassa ja lisää sen tietokantaan.
 * @returns Onnistuessa viestin teoksen lisäämisestä. Muuten virheviesti.
 */
export const lisaaTeos = async (req: Request, res: Response): Promise<any> => {
	try {
		// Jos isbn on tyhjä (ei annettu), asetetaan se nulliksi
		if (req.body.isbn === '') req.body.isbn = null;
		const { isbn, nimi, tekija, julkaisuvuosi, paino, tyyppiId, luokkaId } = req.body;
		// Tarkistetaan, että syötteet ovat oikeanlaisia
		const tarkistus = tarkistaLuoTeos(req.body);
		if (!tarkistus.success) {
			res.status(400).json({ message: tarkistus.message });
			return;
		}

		// Haetaan käyttäjän tiedot ja tarkistetaan, onko käyttäjä divariAdmin, joka käyttää omaa tietokantaansa
		const { rooli, kayttajaId } = req.user as any;
		const kayttajanOmaTietokanta = await haeKayttajanOmaTietokanta(kayttajaId);

		// Haku, joka hakee teoksen joko isbn:n tai tekijän ja nimen perusteella
		const teosHaku = async (isbn: string | undefined, tekija: string, nimi: string, tietokanta?: any) =>
			isbn ? await haeTeosISBNlla(isbn, tietokanta) : await haeTeosTekijanJaNimenPerusteella(tekija, nimi, tietokanta);

		// Jos käyttäjä on admin tai ei käytä omaa tietokantaansa, tarkistetaan teoksen olemassaolo keskusdivarista
		if (rooli === 'admin' || !kayttajanOmaTietokanta) {
			if (await teosHaku(isbn, tekija, nimi)) {
				return res.status(400).json({ message: 'Teos on jo olemassa.' });
			}
			// Lisätään uusi teos keskusdivariin
			await lisaaUusiTeos({ isbn, nimi, tekija, julkaisuvuosi, paino, tyyppiId, luokkaId });
		} else {
			// Jos käyttäjä on divariAdmin ja käyttää omaa tietokantaansa, tarkistetaan teoksen olemassaolo käyttäjän omasta tietokannasta ja keskusdivarista
			const [teosKeskusdivarissa, teosDivarissa] = await Promise.all([
				teosHaku(isbn, tekija, nimi),
				teosHaku(isbn, tekija, nimi, kayttajanOmaTietokanta),
			]);

			// Jos teos löytyy keskusdivarista ja käyttäjän omasta tietokannasta, palautetaan virhe
			if (teosKeskusdivarissa && teosDivarissa) {
				return res.status(400).json({ message: 'Teos on jo olemassa.' });
			}

			// Lisää teos käyttäjän omaan tietokantaan, jos se ei ole vielä siellä
			const [teos] =
				teosDivarissa ||
				teosKeskusdivarissa ||
				(await lisaaUusiTeos({ isbn, nimi, tekija, julkaisuvuosi, paino, tyyppiId, luokkaId }, kayttajanOmaTietokanta));

			// Lisää teos keskusdivariin, jos se ei ole vielä siellä
			await lisaaUusiTeos({
				teosId: teos.teosId,
				isbn,
				nimi,
				tekija,
				julkaisuvuosi,
				paino,
				tyyppiId,
				luokkaId,
			});
		}

		res.status(201).json({ message: 'Teos lisätty.' });
	} catch (error) {
		console.error('Virhe teoksen lisäämisessä:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

/**
 * Vastaa pyyntöön lisätä uusia teosintansseja. Tarkistaa, että teosId on annettu ja lisää instanssit tietokantaan.
 * @returns Onnistuessa viestin teosinstanssin lisäämisestä. Muuten virheviesti.
 */
export const lisaaTeosInstanssi = async (req: Request, res: Response) => {
	try {
		const teosId = req.params.teosId;
		if (!teosId) {
			res.status(400).json({ message: 'Virheellinen teosId.' });
			return;
		}
		const { kpl, hinta, kunto, sisaanostohinta, divariId } = req.body;
		// Tarkistetaan, että syötteet ovat oikeanlaisia
		const tarkistus = tarkistaLuoTeosInstanssi(req.body, kpl);
		if (!tarkistus.success) {
			res.status(400).json({ message: tarkistus.message });
			return;
		}
		// Tarkistetaan, että divariId on annettu ja se vastaa käyttäjän divaria
		const { kayttajaId, divariId: kayttajanDivariId } = req.user as any;
		if (divariId !== kayttajanDivariId) {
			res.status(401).json({ message: 'Ei voi lisätä teosInstanssia toisen divariin.' });
			return;
		}
		// Tarkistetaan, että divari on olemassa
		const divari = await haeDivariIdlla(divariId);
		if (!divari) {
			res.status(400).json({ message: 'Annettua divaria ei löydy.' });
			return;
		}
		// Haetaan käyttäjän oma tietokanta
		const kayttajanOmaTietokanta = await haeKayttajanOmaTietokanta(kayttajaId);
		if (kayttajanOmaTietokanta) {
			// Jos käyttäjä on divariAdmin ja käyttää omaa tietokantaansa, lisätään teosinstanssi(t) käyttäjän omaan tietokantaan
			for (let i = 0; i < kpl; i++) {
				await lisaaUusiTeosInstanssi({ hinta, kunto, sisaanostohinta, teosId }, kayttajanOmaTietokanta);
			}
			res.status(201).json({ message: 'TeosInstanssi(t) lisätty.' });
		} else {
			// Muuten lisätään teosinstanssi(t) keskusdivariin
			for (let i = 0; i < kpl; i++) {
				await lisaaUusiTeosInstanssi({ hinta, kunto, sisaanostohinta, divariId, teosId });
			}
			res.status(201).json({ message: 'TeosInstanssi(t) lisätty.' });
		}
	} catch (error) {
		console.error('Virhe teoksen instanssin lisäämisessä:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

/**
 * Vastaa pyyntöön varata teosinstanssi ostoskoriin. Tarkistaa, että instanssiId on annettu ja varaa sen.
 * 
 * @returns varattu instanssiId tai virheviesti.
 */
export const lisaaInstanssiOstoskoriin = async (req: Request, res: Response) => {
	try {
		const instanssiId = req.params.instanssiId;
		if (!instanssiId) {
			res.status(400).json({ message: 'Virheellinen instanssiId.' });
			return;
		}
		const instanssi = await haeTeosInstanssi(instanssiId);
		if (!instanssi || instanssi.tila !== 'vapaa') {
			const vapaaInstanssi = await haeVapaaTeosInstanssi(instanssi.teosId, instanssi.divariId, instanssi.kunto, instanssi.hinta);
			if (!vapaaInstanssi) {
				res.status(400).json({ message: 'Ei vapaita instansseja.' });
				return;
			}
			await asetaTeosInstanssiOstoskoriin(vapaaInstanssi.teosInstanssiId);
			res.status(201).json({ message: 'TeosInstanssi lisätty ostoskoriin.', instanssiId: vapaaInstanssi.teosInstanssiId });
		} else {
			await asetaTeosInstanssiOstoskoriin(instanssiId);
			res.status(201).json({ message: 'TeosInstanssi lisätty ostoskoriin.', instanssiId: instanssiId });
		}
	} catch (error) {
		console.error('Virhe lisätessä ostoskoriin:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

/**
 * Vapauttaa teosinstanssin. Tarkistaa, että instanssiId on annettu ja vapauttaa sen.
 * 
 * @returns viesti instanssin vapauttamisesta tai virheviesti.
 */
export const vapautaInstanssi = async (req: Request, res: Response) => {
	try {
		const instanssiId = req.params.instanssiId;
		if (!instanssiId) {
			res.status(400).json({ message: 'Virheellinen instanssiId.' });
			return;
		}
		await asetaTeosInstanssiVapaaksi(instanssiId);
		res.status(201).json({ message: 'TeosInstanssi vapautettu.' });
	} catch (error) {
		console.error('Virhe vapautettaessa instanssia:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

/**
 * Vapauttaa useita teosinstansseja. Tarkistaa, että instanssiIdt on annettu ja vapauttaa ne.
 * @returns viesti instanssien vapauttamisesta tai virheviesti.
 */
export const vapautaInstanssit = async (req: Request, res: Response) => {
	try {
		const instanssiIdt = req.body.instanssiIdt;
		if (!instanssiIdt || instanssiIdt.length === 0) {
			res.status(400).json({ message: 'Virheelliset instanssiIdt.' });
			return;
		}
		for (const instanssiId of instanssiIdt) {
			await asetaTeosInstanssiVapaaksi(instanssiId);
		}
		res.status(201).json({ message: 'TeosInstanssi(t) vapautettu.' });
	} catch (error) {
		console.error('Virhe vapautettaessa instanssia:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};
