import db from '../knex';

// Hae postitushinnasto
export const haePostitusHinnasto = async () => {
	const hinnasto = await db('keskusdivari.PostitusHinnasto').select('paino', 'hinta');
	return hinnasto;
};
