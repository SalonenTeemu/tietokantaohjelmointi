import knex, { Knex } from 'knex';

/**
 * Yhdistä tietokantaan knex-kirjaston avulla.
 */
const db: Knex = knex({
	client: 'pg',
	connection: {
		host: 'localhost',
		port: 5432,
		database: 'httusa',
		user: 'postgres',
		password: 'salonen',
	},
	pool: {
		min: 2,
		max: 10,
	},
});

export default db;
