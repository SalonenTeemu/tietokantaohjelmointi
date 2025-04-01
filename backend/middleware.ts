import { NextFunction } from 'express';
import { Request } from 'express';
import { Response } from 'express';
import passport from 'passport';
import { Strategy as JWTStrategy } from 'passport-jwt';
import { haeProfiiliIDlla } from './db/queries/kayttaja';

// JWT-asetukset
export const JWTAsetukset = {
	jwtFromRequest: (req: Request) => {
		let token = null;
		if (req && req.cookies) {
			token = req.cookies['access_token'];
		}
		return token;
	},
	secretOrKey: 'tietokantaohjelmointi-secret',
};

// Määritä JWT-strategia tokenin tarkistamiseksi passport-kirjaston avulla
passport.use(
	new JWTStrategy(JWTAsetukset, async (jwt_payload, done) => {
		try {
			const user = await haeProfiiliIDlla(jwt_payload.kayttajaId);
			if (!user) {
				return done(null, false);
			}
			return done(null, { kayttajaId: user.kayttajaId, divariId: jwt_payload.divariId, rooli: user.rooli });
		} catch (error) {
			console.error('Virhe JWT-strategiassa:', error);
			return done(error, false);
		}
	})
);

// Tarkista JWT-token ja aseta käyttäjätiedot pyyntöön
export const validoiJWT = passport.authenticate('jwt', { session: false });

// Tarkista pyynnön tekijän käyttäjärooli
export const tarkistaRooli = (roles: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const user = req.user as any;
		if (!user || !roles.includes(user.rooli)) {
			res.status(403).json({ message: 'Käyttäjällä ei ole oikeuksia tähän toimintaan.' });
		} else {
			next();
		}
	};
};
