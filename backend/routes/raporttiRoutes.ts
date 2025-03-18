import express from 'express';
import { validoiJWT, tarkistaRooli } from '../middleware';
import { haeLuokanMyynnissaOlevatTeokset, haeDivarinLuokanMyynnissaOlevatTeokset } from '../controllers/raporttiController';

const raporttiRoutes = express.Router({ mergeParams: true });

raporttiRoutes.get('/luokkamyynti', validoiJWT, tarkistaRooli(['admin']), haeLuokanMyynnissaOlevatTeokset);
raporttiRoutes.get('/luokkamyynti/:divariId', validoiJWT, tarkistaRooli(['admin', 'divariAdmin']), haeDivarinLuokanMyynnissaOlevatTeokset);

export default raporttiRoutes;
