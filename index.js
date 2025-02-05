const express = require('express');
const db = require('./db');

const app = express();
const hostname = 'localhost'; // '192.168.4.115';
const port = 8040;

app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

app.get('/admin', (req, res) => {
	res.send('Admin-sivu');
});

app.get('/asiakas', (req, res) => {
	res.send('Asiakassivu');
});

app.use((req, res) => {
	res.sendFile(__dirname + '/public/404.html');
});

app.listen(port, () => {
	console.log(`Palvelin käynnissä osoitteessa http://${hostname}:${port}`);
});
