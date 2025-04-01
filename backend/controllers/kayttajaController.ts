import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { haeKayttajaSahkopostilla, haeKayttajaPuhelimella, lisaaKayttaja, haeKayttajanDivariId, haeProfiiliIDlla } from '../db/queries/kayttaja';
import { haeDivariIdlla } from '../db/queries/divari';
import { tarkistaKirjautuminen, tarkistaRekisteroityminen } from '../utils/validate';
import { JWTAsetukset } from '../middleware';

/**
 * Vastaa pyyntöön käyttäjän kirjautumisesta. Asettaa onnistuessaan JWT-tokenit evästeisiin ja palauttaa käyttäjätiedot.
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
		let divariNimi;
		// Jos käyttäjä on divariAdmin tai admin, hae divariId ja divariNimi
		if (user.rooli === 'divariAdmin' || user.rooli === 'admin') {
			divariId = await haeKayttajanDivariId(user.kayttajaId);
			if (divariId) {
				const divari = await haeDivariIdlla(divariId);
				divariNimi = divari.nimi;
			}
		}
		delete user.salasana;
		// Luodaan tunnin kestävä access-token ja viikon kestävä refresh-token
		const access_token = jwt.sign({ kayttajaId: user.kayttajaId, rooli: user.rooli, divariId: divariId }, JWTAsetukset.secretOrKey, {
			expiresIn: '15m',
		});
		const refresh_token = jwt.sign({ kayttajaId: user.kayttajaId, rooli: user.rooli, divariId: divariId }, JWTAsetukset.secretOrKey, {
			expiresIn: '7d',
		});

		// Asetetaan access_token evästeeseen iällä 15 min ja refresh_token evästeeseen iällä 7 päivää
		res.cookie('access_token', access_token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 900000 });
		res.cookie('refresh_token', refresh_token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 604800000 });
		res.status(200).json({ message: { ...user, divariId, divariNimi } });
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
 * Vastaa pyyntöön käyttäjän uloskirjautumisesta. Poistaa evästeet ja palauttaa viestin uloskirjautumisesta.
 * @returns Viestin uloskirjautumisesta.
 */
export const kirjauduUlos = (req: Request, res: Response) => {
	res.clearCookie('access_token');
	res.clearCookie('refresh_token');
	res.status(200).json({ message: 'Kirjauduttu ulos.' });
};

/**
 * Vastaa pyyntöön tokenien päivittämisestä. Tarkistaa refresh-tokenin ja luo uudet access- ja refresh-tokenit.
 * @returns Onnistuessa viestin tokenien päivityksestä. Muuten virheviesti.
 */
export const paivitaTokenit = async (req: Request, res: Response): Promise<void> => {
	const { refresh_token } = req.cookies;
	if (!refresh_token) {
		res.status(401).json({ message: 'Ei refresh-tokenia.' });
		return;
	}
	try {
		// Tarkista refresh-token ja luo uudet tokenit
		jwt.verify(refresh_token, JWTAsetukset.secretOrKey, (err: any, decoded: any) => {
			if (err) {
				res.status(403).json({ message: 'Virhe tokenin tarkistuksessa.' });
				return;
			}
			const access_token = jwt.sign(
				{ kayttajaId: decoded.kayttajaId, rooli: decoded.rooli, divariId: decoded.divariId },
				JWTAsetukset.secretOrKey,
				{
					expiresIn: '15m',
				}
			);
			const refresh_token = jwt.sign(
				{ kayttajaId: decoded.kayttajaId, rooli: decoded.rooli, divariId: decoded.divariId },
				JWTAsetukset.secretOrKey,
				{
					expiresIn: '7d',
				}
			);
			// Asetetaan access_token evästeeseen iällä 15 min ja refresh_token evästeeseen iällä 7 päivää
			res.cookie('access_token', access_token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 900000 });
			res.cookie('refresh_token', refresh_token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 604800000 });
			res.status(200).json({ message: 'Tokenit päivitetty onnistuneesti.' });
		});
	} catch (error) {
		console.error('Virhe tokenien päivityksessä:', error);
		res.status(500).json({ message: 'Virhe' });
	}
	return;
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
		let divariNimi;
		// Jos käyttäjä on divariAdmin tai admin, hae divariId ja divariNimi
		if (user.rooli === 'divariAdmin' || user.rooli === 'admin') {
			divariId = await haeKayttajanDivariId(user.kayttajaId);
			if (divariId) {
				const divari = await haeDivariIdlla(divariId);
				divariNimi = divari.nimi;
			}
		}
		res.status(200).json({ message: { ...user, divariId, divariNimi } });
	} catch (error) {
		console.error('Virhe profiilin hakemisessa:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};
