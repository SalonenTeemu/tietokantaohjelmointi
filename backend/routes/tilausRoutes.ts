import express from 'express';
import { haeTilaukset } from '../controllers/tilausController';

const tilausRoutes = express.Router({ mergeParams: true });

tilausRoutes.get('/:asiakasId', haeTilaukset);
tilausRoutes.post(':asiakasId', luoTilaus);

export default tilausRoutes;