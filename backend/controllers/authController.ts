import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { haeKayttajaSahkopostilla, haeKayttajaPuhelimella, lisaaKayttaja } from '../db/queries';
import { tarkistaKirjautuminen, tarkistaRekisteroityminen } from '../utils/validate';

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
		res.status(200).json({
			message: {
				kayttajaId: user.kayttajaId,
				email: user.email,
				nimi: user.nimi,
				osoite: user.osoite,
				puhelin: user.puhelin,
				rooli: user.rooli,
			},
		});
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
