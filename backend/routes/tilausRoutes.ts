import express from 'express';
import { haeTilaukset, luoTilaus, vahvistaTilaus, peruutaTilaus } from '../controllers/tilausController';

const tilausRoutes = express.Router({ mergeParams: true });

tilausRoutes.get('/:kayttajaId', haeTilaukset);
tilausRoutes.post('/', luoTilaus);
tilausRoutes.post('/vahvista/:tilausId', vahvistaTilaus);
tilausRoutes.post('/peruuta/:tilausId', peruutaTilaus);

export default tilausRoutes;
