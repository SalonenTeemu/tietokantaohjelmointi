import knex, { Knex } from 'knex';

/**
 * Yhdistä tietokantaan knex-kirjaston avulla.
 */
const db: Knex = knex({
	client: 'pg',
	connection: {
		host: 'the hostname',
		port: 99999999999,
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
	.catch((err: Error) => {
		console.error('Virhe yhteyden luomisessa:', err.message);
		//process.exit(1);
	});

export default db;

/*
Raaka pg-kirjastoa käyttävä versio tarvittaessa.

import { Pool } from 'pg';

const pool = new Pool({
    host: 'the hostname',
    port: 'the port',
    database: 'the database',
    user: 'the user',
    password: 'the password',
    max: 10,
});

export default pool;
*/
