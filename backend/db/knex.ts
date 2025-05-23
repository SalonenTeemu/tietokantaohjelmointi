import knex, { Knex } from 'knex';

/**
 * Tee yhteys PostgreSQL-tietokantaan käyttäen Knex-kirjastoa ja annetua konfiguraatiota.
 */
const db: Knex = knex({
	client: 'pg',
	connection: {
		host: 'localhost',
		port: 5432,
		database: 'httusa',
		user: 'httusa',
		password: 'gIDJGqV5xWwrH59',
	},
	pool: {
		min: 2,
		max: 10,
	},
});

export default db;
