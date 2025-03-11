import express from 'express';
import {
	haeTeoksia,
	haeKaikkiLuokat,
	haeKaikkiTyypit,
	haeTeosInstanssit,
	haeLuokanKokonaismyynti,
	lisaaTeos,
	lisaaTeosInstanssi,
	haeDivarinTeokset,
	haeKaikkiTeokset,
} from '../controllers/teosController';

const teosRoutes = express.Router({ mergeParams: true });

teosRoutes.get('/', haeKaikkiTeokset);
teosRoutes.post('/', lisaaTeos);
teosRoutes.get('/hae', haeTeoksia);
teosRoutes.get('/luokka', haeLuokanKokonaismyynti);
teosRoutes.get('/luokat', haeKaikkiLuokat);
teosRoutes.get('/tyypit', haeKaikkiTyypit);
teosRoutes.get('/:divariId', haeDivarinTeokset);
teosRoutes.get('/:teosId/instanssit', haeTeosInstanssit);
teosRoutes.post('/:teosId', lisaaTeosInstanssi);

export default teosRoutes;
