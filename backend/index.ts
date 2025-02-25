import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db/initDb';
import teosRoutes from './routes/teosRoutes';

const app = express();
app.use(cors());

const hostname = 'localhost';
const port = 8041;

app.listen(port, () => {
	initializeDatabase();
	console.log(`Palvelin käynnissä osoitteessa http://${hostname}:${port}`);
});

app.use('/api/teos', teosRoutes);
