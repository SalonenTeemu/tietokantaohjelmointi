import express from 'express';
import { validoiJWT, tarkistaRooli } from '../middleware';
import {
	haeLuokanMyynnissaOlevatTeokset,
	haeDivarinLuokanMyynnissaOlevatTeokset,
	haeAsiakasRaporttiViimeVuosi,
} from '../controllers/raporttiController';

const raporttiRoutes = express.Router({ mergeParams: true });

raporttiRoutes.get('/luokkamyynti', validoiJWT, tarkistaRooli(['admin']), haeLuokanMyynnissaOlevatTeokset);
raporttiRoutes.get('/luokkamyynti/:divariId', validoiJWT, tarkistaRooli(['admin', 'divariAdmin']), haeDivarinLuokanMyynnissaOlevatTeokset);
raporttiRoutes.get('/asiakas-viime-vuosi', validoiJWT, tarkistaRooli(['admin']), haeAsiakasRaporttiViimeVuosi);

export default raporttiRoutes;
