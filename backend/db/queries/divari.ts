import db from '../knex';

// Hae divari ID:n perusteella keskusdivarista
export const haeDivariIdlla = async (divariId: number) => {
	const divari = await db('keskusdivari.Divari').where('divariId', divariId).first();
	return divari;
};
