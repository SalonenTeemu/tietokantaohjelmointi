import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { haeKayttajaEmaililla, haeKayttajaOlemassa, lisaaKayttaja } from '../db/queries';

// Kirjaudu sisään
export const kirjaudu = async (req: Request, res: Response) => {
	try {
		const { email, salasana } = req.body;
		if (!email || !salasana) {
			res.status(400).json({ message: 'Käyttäjätunnus ja salasana vaaditaan' });
			return;
		}
		const user = await haeKayttajaEmaililla(email);
		if (!user) {
			res.status(401).json({ message: 'Käyttäjää ei löytynyt' });
			return;
		}
		const salasanaOikein = await bcrypt.compare(salasana, user.salasana);
		if (!salasanaOikein) {
			res.status(401).json({ message: 'Väärä salasana' });
			return;
		}
		res.status(200).json({ message: 'Kirjautuminen onnistui' });
	} catch (error) {
		console.error('Virhe kirjautumisessa:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};

// Rekisteröidy
export const rekisteroidy = async (req: Request, res: Response) => {
	try {
		const { email, salasana, nimi, osoite, puhelin } = req.body;
		if (!email || !salasana || !nimi || !osoite || !puhelin) {
			res.status(400).json({ message: 'Kaikki tiedot vaaditaan' });
			return;
		}
		const kayttajaOlemassa = await haeKayttajaOlemassa(puhelin, email);
		if (kayttajaOlemassa) {
			res.status(400).json({ message: 'Käyttäjä annetulla puhelinnumerolla tai sähköpostilla on jo olemassa' });
			return;
		}
		const salasanaHash = await bcrypt.hash(salasana, 10);
		await lisaaKayttaja(email, salasanaHash, nimi, osoite, puhelin);
		res.status(201).json({ message: 'Rekisteröityminen onnistui' });
	} catch (error) {
		console.error('Virhe rekisteröitymisessä:', error);
		res.status(500).json({ message: 'Virhe' });
	}
};
