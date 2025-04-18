import express from 'express';
import { validoiJWT, tarkistaRooli } from '../middleware';
import {
	haeTeoksia,
	haeKaikkiLuokat,
	haeKaikkiTyypit,
	haeTeosInstanssit,
	lisaaTeos,
	lisaaTeosInstanssi,
	haeDivarinTeokset,
	haeKaikkiTeokset,
	lisaaInstanssiOstoskoriin,
	vapautaInstanssi,
	vapautaInstanssit,
} from '../controllers/teosController';

const teosRoutes = express.Router({ mergeParams: true });

teosRoutes.get('/', haeKaikkiTeokset);
teosRoutes.post('/', validoiJWT, tarkistaRooli(['admin', 'divariAdmin']), lisaaTeos);
teosRoutes.get('/hae', haeTeoksia);
teosRoutes.get('/luokat', haeKaikkiLuokat);
teosRoutes.get('/tyypit', haeKaikkiTyypit);
teosRoutes.get('/:divariId', validoiJWT, tarkistaRooli(['divariAdmin']), haeDivarinTeokset);
teosRoutes.get('/:teosId/instanssit', haeTeosInstanssit);
teosRoutes.post('/:teosId', validoiJWT, tarkistaRooli(['divariAdmin']), lisaaTeosInstanssi);
teosRoutes.post('/ostoskori/vapauta', vapautaInstanssit);
teosRoutes.post('/ostoskori/:instanssiId', lisaaInstanssiOstoskoriin);
teosRoutes.post('/ostoskori/:instanssiId/vapauta', vapautaInstanssi);

export default teosRoutes;
