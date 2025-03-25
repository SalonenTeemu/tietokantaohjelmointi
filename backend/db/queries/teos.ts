import db from '../knex';

// Hae kaikki teokset aakkosjärjestyksessä
export const haeTeokset = async () => {
	const teokset = await db('keskusdivari.Teos as t')
		.select('t.teosId', 't.isbn', 't.nimi', 't.tekija', 't.paino', 't.julkaisuvuosi', 'ty.nimi as tyyppi', 'l.nimi as luokka')
		.leftJoin('keskusdivari.Tyyppi as ty', 't.tyyppiId', 'ty.tyyppiId')
		.leftJoin('keskusdivari.Luokka as l', 't.luokkaId', 'l.luokkaId')
		.orderBy('t.nimi');
	return teokset;
};

// R2
export const haeKaikkiLuokanMyynnissaOlevatTeokset = async (divariId?: number) => {
	let query = db('keskusdivari.LuokanMyynnissaOlevatTeokset as lmot').select(
		'lmot.luokka',
		'lmot.lkmMyynnissa',
		'lmot.lkmTeoksia',
		'lmot.kokonaisMyyntihinta',
		'lmot.keskiMyyntihinta'
	);

	if (divariId) {
		query = query.where('lmot.divariId', divariId);
	}
	const teokset = await query;
	return teokset;
};

// R4
export const haeTeoksetHakusanalla = async (hakusanat: any) => {
	const query = db('keskusdivari.Teos as t')
		.select(
			't.teosId',
			't.isbn',
			't.nimi',
			't.tekija',
			'ty.nimi as tyyppi',
			'l.nimi as luokka',
			't.julkaisuvuosi',
			db.raw(
				`(
                    ${hakusanat.nimi ? `CASE WHEN LOWER(t.nimi) LIKE '%' || LOWER(?) || '%' THEN 1 ELSE 0 END` : ''}
                    ${hakusanat.tekija ? `+ CASE WHEN LOWER(t.tekija) LIKE '%' || LOWER(?) || '%' THEN 1 ELSE 0 END` : ''}
                    ${hakusanat.luokka ? `+ CASE WHEN LOWER(l.nimi) LIKE '%' || LOWER(?) || '%' THEN 1 ELSE 0 END` : ''}
                    ${hakusanat.tyyppi ? `+ CASE WHEN LOWER(ty.nimi) LIKE '%' || LOWER(?) || '%' THEN 1 ELSE 0 END` : ''}
                ) AS osumien_maara`,
				[
					...(hakusanat.nimi ? [hakusanat.nimi] : []),
					...(hakusanat.tekija ? [hakusanat.tekija] : []),
					...(hakusanat.luokka ? [hakusanat.luokka] : []),
					...(hakusanat.tyyppi ? [hakusanat.tyyppi] : []),
				]
			)
		)
		.leftJoin('keskusdivari.Tyyppi as ty', 't.tyyppiId', 'ty.tyyppiId')
		.leftJoin('keskusdivari.Luokka as l', 't.luokkaId', 'l.luokkaId');

	const hakuEhdot: string[] = [];
	const hakuArvot: string[] = [];

	const lisaaHakuehto = (column: string, value: string | null) => {
		if (value) {
			const sanat = value.split(/\s+/);
			sanat.forEach((sana) => {
				hakuEhdot.push(`LOWER(${column}) LIKE '%' || LOWER(?) || '%'`);
				hakuArvot.push(sana);
			});
		}
	};

	lisaaHakuehto('t.nimi', hakusanat.nimi);
	lisaaHakuehto('t.tekija', hakusanat.tekija);
	lisaaHakuehto('l.nimi', hakusanat.luokka);
	lisaaHakuehto('ty.nimi', hakusanat.tyyppi);

	if (hakuEhdot.length > 0) {
		query.whereRaw(hakuEhdot.join(' AND '), hakuArvot);
	}

	query
		.groupBy('t.teosId', 't.isbn', 't.nimi', 't.tekija', 'ty.nimi', 'l.nimi', 't.julkaisuvuosi')
		.orderBy([{ column: 'osumien_maara', order: 'desc' }, { column: 't.nimi' }]);

	return query;
};

// Hae teos ID:llä
export const haeTeosIdlla = async (teosId: string) => {
	const teos = await db('keskusdivari.Teos').where('teosId', teosId).first();
	return teos;
};

// Hae teos ISBN:llä
export const haeTeosISBNlla = async (isbn: string, tietokanta = 'keskusdivari') => {
	const teos = await db(tietokanta + '.Teos')
		.where('isbn', isbn)
		.first();
	return teos;
};

// Hae teokset, jotka ovat myynnissä tietyssä divarissa
export const haeDivarinMyymatTeokset = async (divariId: number) => {
	const teokset = await db('keskusdivari.TeosInstanssi as ti')
		.select(
			't.teosId',
			't.isbn',
			't.nimi',
			't.tekija',
			't.paino',
			'ty.nimi as tyyppi',
			'l.nimi as luokka',
			't.julkaisuvuosi',
			db.raw('CAST(COUNT("ti"."teosInstanssiId") AS INTEGER) as instanssi_lkm')
		)
		.join('keskusdivari.Teos as t', 'ti.teosId', 't.teosId')
		.join('keskusdivari.Tyyppi as ty', 't.tyyppiId', 'ty.tyyppiId')
		.join('keskusdivari.Luokka as l', 't.luokkaId', 'l.luokkaId')
		.where('ti.divariId', divariId)
		.groupBy('t.teosId', 't.isbn', 't.nimi', 't.tekija', 'ty.nimi', 'l.nimi', 't.julkaisuvuosi');
	return teokset;
};

// Teoksen instanssit
export const haeTeoksenInstanssit = async (teosId: string) => {
	const instanssit = await db('keskusdivari.TeosInstanssi as ti')
		.select('ti.teosInstanssiId', 'ti.hinta', 'ti.tila', 'ti.kunto', 'd.nimi as divari')
		.join('keskusdivari.Divari as d', 'ti.divariId', 'd.divariId')
		.where('ti.teosId', teosId);

	return instanssit;
};

// Lisää uusi teos
export const lisaaUusiTeos = async (teos: any, tietokanta = 'keskusdivari') => {
	if (teos.isbn == null || teos.isbn === '') {
		delete teos.isbn;
	}
	return await db(tietokanta + '.Teos')
		.insert(teos)
		.returning('*');
};

// Hae kaikki luokat
export const haeLuokat = async () => {
	const luokat = await db('keskusdivari.Luokka').select('luokkaId', 'nimi');
	return luokat;
};

// Hae kaikki tyypit
export const haeTyypit = async () => {
	const tyypit = await db('keskusdivari.Tyyppi').select('tyyppiId', 'nimi');
	return tyypit;
};

// Hae teos tekijän ja nimen perusteella
export const haeTeosTekijanJaNimenPerusteella = async (tekija: string, nimi: string, tietokanta = 'keskusdivari') => {
	const teos = await db(tietokanta + '.Teos')
		.where('tekija', tekija)
		.andWhere('nimi', nimi)
		.first();
	return teos;
};

export const haeOmanTietokannanTeos = async (teosId: string, tietokanta = 'keskusdivari') => {
	const teos = await db(tietokanta + '.Teos')
		.where('teosId', teosId)
		.first();
	return teos;
};
