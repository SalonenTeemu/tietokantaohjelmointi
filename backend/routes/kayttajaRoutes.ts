import express from 'express';
import { kirjaudu, rekisteroidy, kirjauduUlos, haeProfiili } from '../controllers/kayttajaController';
import { validoiJWT } from '../middleware';

const kayttajaRoutes = express.Router({ mergeParams: true });

kayttajaRoutes.post('/kirjaudu', kirjaudu);
kayttajaRoutes.post('/rekisteroidy', rekisteroidy);
kayttajaRoutes.post('/kirjaudu-ulos', kirjauduUlos);
kayttajaRoutes.get('/profiili', validoiJWT, haeProfiili);

export default kayttajaRoutes;
