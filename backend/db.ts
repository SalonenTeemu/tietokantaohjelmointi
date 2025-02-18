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

// const db: Knex = knex({
// 	client: 'pg',
// 	connection: {
// 		host: 'localhost',
// 		port: 5432,
// 		database: 'httusa',
// 		user: 'httusa',
// 		password: 'gIDJGqV5xWwrH59',
// 	},
// 	pool: {
// 		min: 2,
// 		max: 10,
// 	},
// });

// Testaa yhteyttä tietokantaan
export const initializeDatabase = async () => {
	try {
		await db.raw('SELECT 1');
		console.log('Yhteys tietokantaan onnistui');
	} catch (err: unknown) {
		console.error('Virhe yhteyden luomisessa:', err);
	}
};

export default db;
