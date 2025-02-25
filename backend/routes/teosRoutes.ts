import express from 'express';
import { haeTeoksia, haeTeosInstanssit } from '../controllers/teosController';

const teosRoutes = express.Router({ mergeParams: true });

teosRoutes.get('/', haeTeoksia);
teosRoutes.get('/:teosId/instanssit', haeTeosInstanssit);

export default teosRoutes;