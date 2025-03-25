import { Request, Response } from 'express';
import {
	haeTeoksetHakusanalla,
	haeTeoksenInstanssit,
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
		const instanssit = await haeTeoksenInstanssit(teosId);
		res.status(200).json({ message: instanssit });
	} catch (error) {
		console.error('Virhe haettaessa teoksen instansseja:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

// Lisää uusi teos
export const lisaaTeosOMA = async (req: Request, res: Response) => {
	try {
		const { isbn, nimi, tekija, julkaisuvuosi, paino, tyyppiId, luokkaId } = req.body;
		const tarkistus = tarkistaLuoTeos(req.body);
		if (!tarkistus.success) {
			res.status(400).json({ message: tarkistus.message });
			return;
		}
		const rooli = (req.user as any).rooli;
		const kayttajanOmaTietokanta = await haeKayttajanOmaTietokanta((req.user as any).kayttajaId);
		if (rooli === 'admin' || !kayttajanOmaTietokanta) {
			if (isbn) {
				const teos = await haeTeosISBNlla(isbn);
				if (teos) {
					res.status(400).json({ message: 'Teos on jo olemassa.' });
					return;
				}
			}
			const teosOlemassa = await haeTeosTekijanJaNimenPerusteella(tekija, nimi);
			if (teosOlemassa) {
				res.status(400).json({ message: 'Teos on jo olemassa.' });
				return;
			}
			await lisaaUusiTeos({ isbn, nimi, tekija, julkaisuvuosi, paino, tyyppiId, luokkaId });
			res.status(201).json({ message: 'Teos lisätty.' });
			return;
		} else {
			let teosKeskusdivarissa;
			let teosDivarissa;
			if (isbn) {
				teosKeskusdivarissa = await haeTeosISBNlla(isbn);
				teosDivarissa = await haeTeosISBNlla(isbn, kayttajanOmaTietokanta);
			} else {
				teosKeskusdivarissa = await haeTeosTekijanJaNimenPerusteella(tekija, nimi);
				teosDivarissa = await haeTeosTekijanJaNimenPerusteella(tekija, nimi, kayttajanOmaTietokanta);
			}
			if (teosKeskusdivarissa && teosDivarissa) {
				res.status(400).json({ message: 'Teos on jo olemassa.' });
				return;
			} else if (!teosKeskusdivarissa && teosDivarissa) {
				await lisaaUusiTeos({
					teosId: teosDivarissa.teosId,
					isbn,
					nimi: teosDivarissa.nimi,
					tekija: teosDivarissa.tekija,
					julkaisuvuosi: teosDivarissa.julkaisuvuosi,
					paino: teosDivarissa.paino,
					tyyppiId: teosDivarissa.tyyppiId,
					luokkaId: teosDivarissa.luokkaId,
				});
				res.status(201).json({ message: 'Teos lisätty.' });
			} else if (teosKeskusdivarissa && !teosDivarissa) {
				await lisaaUusiTeos(
					{
						teosId: teosKeskusdivarissa.teosId,
						isbn,
						nimi: teosKeskusdivarissa.nimi,
						tekija: teosKeskusdivarissa.tekija,
						julkaisuvuosi: teosKeskusdivarissa.julkaisuvuosi,
						paino: teosKeskusdivarissa.paino,
						tyyppiId: teosKeskusdivarissa.tyyppiId,
						luokkaId: teosKeskusdivarissa.luokkaId,
					},
					kayttajanOmaTietokanta
				);
				res.status(201).json({ message: 'Teos lisätty.' });
			} else {
				const [uusiTeos] = await lisaaUusiTeos({ isbn, nimi, tekija, julkaisuvuosi, paino, tyyppiId, luokkaId }, kayttajanOmaTietokanta);
				await lisaaUusiTeos({
					teosId: uusiTeos.teosId,
					isbn,
					nimi,
					tekija,
					julkaisuvuosi,
					paino,
					tyyppiId,
					luokkaId,
				});
				res.status(201).json({ message: 'Teos lisätty.' });
			}
		}
	} catch (error) {
		console.error('Virhe teoksen lisäämisessä:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

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
		console.log('kayttajanOmaTietokanta', kayttajanOmaTietokanta);

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
		const divari = await haeDivariIdlla(divariId);
		if (!divari) {
			res.status(400).json({ message: 'Annettua divaria ei löydy.' });
			return;
		}
		for (let i = 0; i < kpl; i++) {
			await lisaaUusiTeosInstanssi({ hinta, kunto, sisaanostohinta, divariId, teosId });
		}
		res.status(201).json({ message: 'TeosInstanssi lisätty.' });
	} catch (error) {
		console.error('Virhe teoksen instanssin lisäämisessä:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};
