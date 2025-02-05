/**
 * Yhdistä tietokantaan knex-kirjaston avulla.
 */
const db = require('knex')({
	client: 'pg',
	connection: {
		host: 'the hostname',
		port: 'the port',
		database: 'the database',
		user: 'the user',
		password: 'the password',
	},
	pool: {
		min: 2,
		max: 10,
	},
});

// Testaa yhteyttä tietokantaan
db.raw('SELECT 1')
	.then(() => {
		console.log('Yhteys tietokantaan onnistui');
	})
	.catch((err) => {
		console.error('Virhe yhteyden luomisessa:', err.message);
		//process.exit(1);
	});

module.exports = db;

/*
Raaka pg-kirjastoa käyttävä versio tarvittaessa.

const { Pool } = require('pg');

const pool = new Pool({
	host: 'the hostname',
	port: 'the port',
	database: 'the database',
	user: 'the user',
	password: 'the password',
	max: 10,
});

module.exports = pool;
*/
