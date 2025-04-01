import express from 'express';
import { kirjaudu, rekisteroidy, kirjauduUlos, haeProfiili, paivitaTokenit } from '../controllers/kayttajaController';
import { validoiJWT } from '../middleware';

const kayttajaRoutes = express.Router({ mergeParams: true });

kayttajaRoutes.post('/kirjaudu', kirjaudu);
kayttajaRoutes.post('/rekisteroidy', rekisteroidy);
kayttajaRoutes.post('/kirjaudu-ulos', kirjauduUlos);
kayttajaRoutes.post('/paivita', paivitaTokenit);
kayttajaRoutes.get('/profiili', validoiJWT, haeProfiili);

export default kayttajaRoutes;
