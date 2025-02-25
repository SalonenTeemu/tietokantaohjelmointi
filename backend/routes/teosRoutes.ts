import express from 'express';
import { haeTeoksia, haeTeosInstanssit, haeLuokanKokonaismyynti } from '../controllers/teosController';

const teosRoutes = express.Router({ mergeParams: true });

teosRoutes.get('/', haeTeoksia);
teosRoutes.get('/luokka', haeLuokanKokonaismyynti);
teosRoutes.get('/:teosId/instanssit', haeTeosInstanssit);

export default teosRoutes;
