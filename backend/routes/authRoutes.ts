import express from 'express';
import { kirjaudu, rekisteroidy } from '../controllers/authController';

const authRoutes = express.Router({ mergeParams: true });

authRoutes.post('/kirjaudu', kirjaudu);
authRoutes.post('/rekisteroidy', rekisteroidy);

export default authRoutes;
