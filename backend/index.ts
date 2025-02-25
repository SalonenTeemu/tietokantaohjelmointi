import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db/initDb';
import teosRoutes from './routes/teosRoutes';
import tilausRoutes from './routes/tilausRoutes';

const app = express();
app.use(cors());

const hostname = 'localhost';
const port = 8041;

app.listen(port, () => {
	initializeDatabase();
	console.log(`Palvelin käynnissä osoitteessa http://${hostname}:${port}`);
});

app.use('/api/teos', teosRoutes);
app.use('/api/tilaus', tilausRoutes);
