import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { alustaTietokanta } from './db/initDb';
import teosRoutes from './routes/teosRoutes';
import tilausRoutes from './routes/tilausRoutes';
import kayttajaRoutes from './routes/kayttajaRoutes';
import raporttiRoutes from './routes/raporttiRoutes';

// Palvelimen tiedot
const hostname = 'localhost';
const port = 8041;

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:8040', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Reitit
app.use('/api/teos', teosRoutes);
app.use('/api/tilaus', tilausRoutes);
app.use('/api/auth', kayttajaRoutes);
app.use('/api/raportti', raporttiRoutes);

// Kuuntele porttia ja alusta tietokanta
app.listen(port, () => {
	alustaTietokanta();
	console.log(`Palvelin käynnissä osoitteessa http://${hostname}:${port}`);
});
