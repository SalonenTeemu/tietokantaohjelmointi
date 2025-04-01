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
import { lisaaUusiTeosInstanssi } from '../db/queries/teosInstanssi';
import { haeKayttajanOmaTietokanta } from '../db/queries/kayttaja';

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
		const instanssit = await haeTeoksenVapaatInstanssit(teosId);
		res.status(200).json({ message: instanssit });
	} catch (error) {
		console.error('Virhe haettaessa teoksen instansseja:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

// Lisää uusi teos
export const lisaaTeos = async (req: Request, res: Response): Promise<any> => {
	try {
		if (req.body.isbn === '') req.body.isbn = null;
		const { isbn, nimi, tekija, julkaisuvuosi, paino, tyyppiId, luokkaId } = req.body;
		const tarkistus = tarkistaLuoTeos(req.body);
		if (!tarkistus.success) {
			res.status(400).json({ message: tarkistus.message });
			return;
		}

		const { rooli, kayttajaId } = req.user as any;
		const kayttajanOmaTietokanta = await haeKayttajanOmaTietokanta(kayttajaId);

		const teosHaku = async (isbn: string | undefined, tekija: string, nimi: string, tietokanta?: any) =>
			isbn ? await haeTeosISBNlla(isbn, tietokanta) : await haeTeosTekijanJaNimenPerusteella(tekija, nimi, tietokanta);

		if (rooli === 'admin' || !kayttajanOmaTietokanta) {
			if (await teosHaku(isbn, tekija, nimi)) {
				return res.status(400).json({ message: 'Teos on jo olemassa.' });
			}
			await lisaaUusiTeos({ isbn, nimi, tekija, julkaisuvuosi, paino, tyyppiId, luokkaId });
		} else {
			const [teosKeskusdivarissa, teosDivarissa] = await Promise.all([
				teosHaku(isbn, tekija, nimi),
				teosHaku(isbn, tekija, nimi, kayttajanOmaTietokanta),
			]);

			if (teosKeskusdivarissa && teosDivarissa) {
				return res.status(400).json({ message: 'Teos on jo olemassa.' });
			}

			const [teos] =
				teosDivarissa ||
				teosKeskusdivarissa ||
				(await lisaaUusiTeos({ isbn, nimi, tekija, julkaisuvuosi, paino, tyyppiId, luokkaId }, kayttajanOmaTietokanta));

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
		const { kayttajaId, divariId: kayttajanDivariId } = req.user as any;
		if (divariId !== kayttajanDivariId) {
			res.status(401).json({ message: 'Ei voi lisätä teosInstanssia toisen divariin.' });
			return;
		}
		const divari = await haeDivariIdlla(divariId);
		if (!divari) {
			res.status(400).json({ message: 'Annettua divaria ei löydy.' });
			return;
		}
		const kayttajanOmaTietokanta = await haeKayttajanOmaTietokanta(kayttajaId);
		if (kayttajanOmaTietokanta) {
			for (let i = 0; i < kpl; i++) {
				await lisaaUusiTeosInstanssi({ hinta, kunto, sisaanostohinta, teosId }, kayttajanOmaTietokanta);
			}
			res.status(201).json({ message: 'TeosInstanssi(t) lisätty.' });
		} else {
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
