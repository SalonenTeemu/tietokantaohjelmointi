import express from 'express';
import { validoiJWT, tarkistaRooli } from '../middleware';
import { haeTilaukset, luoTilaus, vahvistaTilaus, peruutaTilaus } from '../controllers/tilausController';

const tilausRoutes = express.Router({ mergeParams: true });

tilausRoutes.get('/:kayttajaId', validoiJWT, tarkistaRooli(['admin']), haeTilaukset);
tilausRoutes.post('/', validoiJWT, luoTilaus);
tilausRoutes.post('/vahvista/:tilausId', validoiJWT, vahvistaTilaus);
tilausRoutes.post('/peruuta/:tilausId', validoiJWT, peruutaTilaus);

export default tilausRoutes;
