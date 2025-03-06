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
} from '../controllers/teosController';

const teosRoutes = express.Router({ mergeParams: true });

teosRoutes.get('/', haeTeoksia);
teosRoutes.get('/:divariId', haeDivarinTeokset);
teosRoutes.get('/luokat', haeKaikkiLuokat);
teosRoutes.get('/tyypit', haeKaikkiTyypit);
teosRoutes.get('/luokka', haeLuokanKokonaismyynti);
teosRoutes.get('/:teosId/instanssit', haeTeosInstanssit);
teosRoutes.post('/', lisaaTeos);
teosRoutes.post('/:teosId', lisaaTeosInstanssi);

export default teosRoutes;
