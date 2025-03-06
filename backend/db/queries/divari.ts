import db from '../knex';

// Hae divari id:llä
export const haeDivariIdlla = async (divariId: number) => {
	const divari = await db('keskusdivari.Divari').where('divariId', divariId).first();
	return divari;
};
