import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { haeKayttajaSahkopostilla, haeKayttajaPuhelimella, lisaaKayttaja, haeKayttajanDivariId, haeProfiiliIDlla } from '../db/queries/kayttaja';
import { tarkistaKirjautuminen, tarkistaRekisteroityminen } from '../utils/validate';
import { JWTAsetukset } from '../middleware';

/**
 * Vastaa pyyntöön käyttäjän kirjautumisesta. Asettaa onnistuessaan JWT-tokenin evästeisiin ja palauttaa käyttäjätiedot.
 * @returns Onnistuessa käyttäjän tiedot mukaan lukien divariId, jos käyttäjä on divariAdmin tai admin. Muuten virheviesti.
 */
export const kirjaudu = async (req: Request, res: Response) => {
	try {
		const { email, salasana } = req.body;
		const tarkistus = tarkistaKirjautuminen(email, salasana);
		if (!tarkistus.success) {
			res.status(400).json({ message: tarkistus.message });
			return;
		}
		const user = await haeKayttajaSahkopostilla(email);
		if (!user) {
			res.status(401).json({ message: 'Käyttäjää annetulla sähköpostilla ei löydy.' });
			return;
		}
		// Tarkista salasana bcryptin avulla
		const salasanaOikein = await bcrypt.compare(salasana, user.salasana);
		if (!salasanaOikein) {
			res.status(401).json({ message: 'Väärä salasana.' });
			return;
		}
		let divariId;
		// Jos käyttäjä on divariAdmin tai admin, hae divariId
		if (user.rooli === 'divariAdmin' || user.rooli === 'admin') {
			divariId = await haeKayttajanDivariId(user.kayttajaId);
		}
		delete user.salasana;
		// Luodaan tunnin kestävä JWT-token
		const token = jwt.sign({ kayttajaId: user.kayttajaId, rooli: user.rooli, divariId: divariId }, JWTAsetukset.secretOrKey, {
			expiresIn: '1h',
		});

		// Asetetaan token evästeeseen iällä 1 tunti
		res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 3600000 });
		res.status(200).json({ message: { ...user, divariId } });
	} catch (error) {
		console.error('Virhe kirjautumisessa:', error);
		res.status(500).json({ message: 'Virhe kirjautumisessa.' });
	}
};

/**
 * Vastaa pyyntöön käyttäjän rekisteröitymisestä. Tarkistaa syötteet ja lisää uuden käyttäjän tietokantaan.
 * @returns Onnistuessa viestin rekisteröitymisestä. Muuten virheviesti.
 */
export const rekisteroidy = async (req: Request, res: Response) => {
	try {
		const { email, salasana, nimi, osoite, puhelin } = req.body;
		const tarkistus = tarkistaRekisteroityminen(email, salasana, nimi, osoite, puhelin);
		if (!tarkistus.success) {
			res.status(400).json({ message: tarkistus.message });
			return;
		}
		// Tarkista, onko käyttäjä jo olemassa sähköpostilla tai puhelimella
		const kayttajaPuhelimella = await haeKayttajaPuhelimella(puhelin);
		if (kayttajaPuhelimella) {
			res.status(400).json({ message: 'Käyttäjä on jo olemassa annetulla puhelinnumerolla.' });
			return;
		}
		const kayttajaSahkopostilla = await haeKayttajaSahkopostilla(email);
		if (kayttajaSahkopostilla) {
			res.status(400).json({ message: 'Käyttäjä on jo olemassa annetulla sähköpostilla.' });
			return;
		}
		// Hashataan salasana bcryptin avulla ja lisätään uusi käyttäjä tietokantaan
		const salasanaHash = await bcrypt.hash(salasana, 10);
		await lisaaKayttaja(email, salasanaHash, nimi, osoite, puhelin);
		res.status(201).json({ message: 'Rekisteröityminen onnistui.' });
	} catch (error) {
		console.error('Virhe rekisteröitymisessä:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

/**
 * Vastaa pyyntöön käyttäjän uloskirjautumisesta. Poistaa evästeen ja palauttaa viestin uloskirjautumisesta.
 * @returns Viestin uloskirjautumisesta.
 */
export const kirjauduUlos = (req: Request, res: Response) => {
	res.clearCookie('token');
	res.status(200).json({ message: 'Kirjauduttu ulos.' });
};

/**
 * Hakee käyttäjän profiilin ID:n perusteella. Jos käyttäjä on divariAdmin tai admin, hakee myös divariId:n.
 * @returns Onnistuessa käyttäjätiedot ja mahdollinen divariId. Muuten virheviesti.
 */
export const haeProfiili = async (req: Request, res: Response) => {
	try {
		const id = (req.user as any).kayttajaId;
		const user = await haeProfiiliIDlla(id);
		if (!user) {
			res.status(403).json({ message: 'Käyttäjää ei löydy.' });
			return;
		}
		let divariId;
		// Jos käyttäjä on divariAdmin tai admin, hae divariId
		if (user.rooli === 'divariAdmin' || user.rooli === 'admin') {
			divariId = await haeKayttajanDivariId(user.kayttajaId);
		}
		res.status(200).json({ message: { ...user, divariId } });
	} catch (error) {
		console.error('Virhe profiilin hakemisessa:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};
