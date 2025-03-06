import express from 'express';
import { kirjaudu, rekisteroidy } from '../controllers/kayttajaController';

const kayttajaRoutes = express.Router({ mergeParams: true });

kayttajaRoutes.post('/kirjaudu', kirjaudu);
kayttajaRoutes.post('/rekisteroidy', rekisteroidy);

export default kayttajaRoutes;
