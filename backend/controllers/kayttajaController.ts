import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { haeKayttajaSahkopostilla, haeKayttajaPuhelimella, lisaaKayttaja, haeKayttajanDivariId, haeProfiiliIDlla } from '../db/queries/kayttaja';
import { tarkistaKirjautuminen, tarkistaRekisteroityminen } from '../utils/validate';
import { JWTAsetukset } from '../middleware';

// Kirjaudu sisään
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
		const salasanaOikein = await bcrypt.compare(salasana, user.salasana);
		if (!salasanaOikein) {
			res.status(401).json({ message: 'Väärä salasana.' });
			return;
		}
		let divariId;
		if (user.rooli === 'divariAdmin' || user.rooli === 'admin') {
			divariId = await haeKayttajanDivariId(user.kayttajaId);
		}
		delete user.salasana;
		const token = jwt.sign({ kayttajaId: user.kayttajaId, rooli: user.rooli }, JWTAsetukset.secretOrKey, { expiresIn: '1h' });

		res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });
		res.status(200).json({ message: { ...user, divariId } });
	} catch (error) {
		console.error('Virhe kirjautumisessa:', error);
		res.status(500).json({ message: 'Virhe kirjautumisessa.' });
	}
};

// Rekisteröidy
export const rekisteroidy = async (req: Request, res: Response) => {
	try {
		const { email, salasana, nimi, osoite, puhelin } = req.body;
		const tarkistus = tarkistaRekisteroityminen(email, salasana, nimi, osoite, puhelin);
		if (!tarkistus.success) {
			res.status(400).json({ message: tarkistus.message });
			return;
		}
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
		const salasanaHash = await bcrypt.hash(salasana, 10);
		await lisaaKayttaja(email, salasanaHash, nimi, osoite, puhelin);
		res.status(201).json({ message: 'Rekisteröityminen onnistui.' });
	} catch (error) {
		console.error('Virhe rekisteröitymisessä:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

// Kirjaudu ulos
export const kirjauduUlos = (req: Request, res: Response) => {
	res.clearCookie('token');
	res.status(200).json({ message: 'Kirjauduttu ulos.' });
};

// Hae kirjautuneen käyttäjän tiedot
export const haeProfiili = async (req: Request, res: Response) => {
	try {
		const id = (req.user as any).kayttajaId;
		const user = await haeProfiiliIDlla(id);
		if (!user) {
			res.status(403).json({ message: 'Käyttäjää ei löydy.' });
			return;
		}
		let divariId;
		if (user.rooli === 'divariAdmin' || user.rooli === 'admin') {
			divariId = await haeKayttajanDivariId(user.kayttajaId);
		}
		res.status(200).json({ message: { ...user, divariId } });
	} catch (error) {
		console.error('Virhe profiilin hakemisessa:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};
