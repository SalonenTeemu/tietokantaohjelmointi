import express, { Request, Response } from 'express';
import { initializeDatabase } from './db';

const app = express();
const hostname = 'localhost';
const port = 8041;

app.get('/data', async (req: Request, res: Response) => {
	try {
		res.json('täs dataa');
	} catch (error) {
		console.error('Failed to fetch data', error);
		res.status(500).json({ error: 'Failed to fetch data' });
	}
});

app.listen(port, () => {
	initializeDatabase();
	console.log(`Palvelin käynnissä osoitteessa http://${hostname}:${port}`);
});
