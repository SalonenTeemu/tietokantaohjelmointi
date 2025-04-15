import knex, { Knex } from 'knex';

/**
 * Tee yhteys PostgreSQL-tietokantaan käyttäen Knex-kirjastoa ja annetua konfiguraatiota.
 */
const db: Knex = knex({
	client: 'pg',
	connection: {
		host: 'localhost',
		port: 5432,
		database: 'httusa', //'httusa',
		user: 'httusa', //'postgres',
		password: 'gIDJGqV5xWwrH59', //'salonen',
	},
	pool: {
		min: 2,
		max: 10,
	},
});

export default db;
