import db from '../knex';

// Hae kaikki teokset keskusdivarista
export const haeTeokset = async () => {
	const teokset = await db('keskusdivari.Teos as t')
		.select('t.teosId', 't.isbn', 't.nimi', 't.tekija', 't.paino', 't.julkaisuvuosi', 'ty.nimi as tyyppi', 'l.nimi as luokka')
		.leftJoin('keskusdivari.Tyyppi as ty', 't.tyyppiId', 'ty.tyyppiId')
		.leftJoin('keskusdivari.Luokka as l', 't.luokkaId', 'l.luokkaId')
		.orderBy('t.nimi');
	return teokset;
};

// Hae kaikki teokset keskusdivarista. Jos divariId on annettu, hae vain kyseisen divarin teokset.
export const haeKaikkiLuokanMyynnissaOlevatTeokset = async (divariId?: number) => {
	let query = db('keskusdivari.LuokanMyynnissaOlevatTeokset as lmot').select(
		'lmot.luokka',
		'lmot.lkmMyynnissa',
		'lmot.lkmTeoksia',
		'lmot.kokonaisMyyntihinta',
		'lmot.keskiMyyntihinta'
	);

	// Jos divariId on annettu, rajaa kysely vain kyseiseen divariin
	if (divariId) {
		query = query.where('lmot.divariId', divariId);
	}
	const teokset = await query;
	return teokset;
};

// Hae teokset annetuilla hakusanoilla keskusdivarista. Hakusanat sisältää kentät: nimi, tekija, luokka, tyyppi.
export const haeTeoksetHakusanalla = async (hakusanat: any) => {
	// Haetaan nimen, tekijän, luokan ja tyypin perusteella osumia teoksista
	// Jos saadaan osuma, lisätään yksi osumien määrään
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

	// Funktio, joka lisää hakuehdon ja arvon listaan
	const lisaaHakuehtoJaArvo = (sarake: string, arvo: string | null) => {
		if (arvo) {
			const sanat = arvo.split(/\s+/);
			sanat.forEach((sana) => {
				hakuEhdot.push(`LOWER(${sarake}) LIKE '%' || LOWER(?) || '%'`);
				hakuArvot.push(sana);
			});
		}
	};

	// Lisätään hakuehdot ja arvot kyselystä
	lisaaHakuehtoJaArvo('t.nimi', hakusanat.nimi);
	lisaaHakuehtoJaArvo('t.tekija', hakusanat.tekija);
	lisaaHakuehtoJaArvo('l.nimi', hakusanat.luokka);
	lisaaHakuehtoJaArvo('ty.nimi', hakusanat.tyyppi);

	// Jos hakuehtoja on, tehdään kysely
	if (hakuEhdot.length > 0) {
		query.whereRaw(hakuEhdot.join(' AND '), hakuArvot);
	}

	// Ryhmitellään ja järjestetään tulokset osumien määrän ja nimen mukaan
	query
		.groupBy('t.teosId', 't.isbn', 't.nimi', 't.tekija', 'ty.nimi', 'l.nimi', 't.julkaisuvuosi')
		.orderBy([{ column: 'osumien_maara', order: 'desc' }, { column: 't.nimi' }]);

	return query;
};

// Hae teos ID:n perusteella keskusdivarista
export const haeTeosIdlla = async (teosId: string) => {
	const teos = await db('keskusdivari.Teos').where('teosId', teosId).first();
	return teos;
};

// Hae teos ISBN:n perusteella tietokannasta. Jos tietokantaa ei annettu, käytetään keskusdivaria.
export const haeTeosISBNlla = async (isbn: string, tietokanta = 'keskusdivari') => {
	const teos = await db(tietokanta + '.Teos')
		.where('isbn', isbn)
		.first();
	return teos;
};

// Hae teokset, jotka ovat myynnissä tietyssä divarissa ID:n perusteella keskusdivarista
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

// Hae teoksen instanssit teosID:n perusteella keskusdivarista
export const haeTeoksenInstanssit = async (teosId: string) => {
	const instanssit = await db('keskusdivari.TeosInstanssi as ti')
		.select('ti.teosInstanssiId', 'ti.hinta', 'ti.tila', 'ti.kunto', 'd.nimi as divari')
		.join('keskusdivari.Divari as d', 'ti.divariId', 'd.divariId')
		.where('ti.teosId', teosId);

	return instanssit;
};

// Lisää uusi teos tietokantaan. Jos tietokantaa ei annettu, käytetään keskusdivaria.
export const lisaaUusiTeos = async (teos: any, tietokanta = 'keskusdivari') => {
	if (teos.isbn == null || teos.isbn === '') {
		delete teos.isbn;
	}
	return await db(tietokanta + '.Teos')
		.insert(teos)
		.returning('*');
};

// Hae kaikki luokat keskusdivarista
export const haeLuokat = async () => {
	const luokat = await db('keskusdivari.Luokka').select('luokkaId', 'nimi');
	return luokat;
};

// Hae kaikki tyypit keskusdivarista
export const haeTyypit = async () => {
	const tyypit = await db('keskusdivari.Tyyppi').select('tyyppiId', 'nimi');
	return tyypit;
};

// Hae teos tekijän ja nimen perusteella tietokannasta. Jos tietokantaa ei annettu, käytetään keskusdivaria.
export const haeTeosTekijanJaNimenPerusteella = async (tekija: string, nimi: string, tietokanta = 'keskusdivari') => {
	const teos = await db(tietokanta + '.Teos')
		.where('tekija', tekija)
		.andWhere('nimi', nimi)
		.first();
	return teos;
};
