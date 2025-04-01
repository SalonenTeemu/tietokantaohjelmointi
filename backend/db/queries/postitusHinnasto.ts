import db from '../knex';

// Hae postitushinnasto keskusdivarista
export const haePostitusHinnasto = async () => {
	const hinnasto = await db('keskusdivari.PostitusHinnasto').select('paino', 'hinta');
	return hinnasto;
};
