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

// Hae kaikki annetun divarin myynnissa olevat teokset luokittain.
export const haeLuokanMyynnissaOlevatTeoksetDivari = async (divariId: number) => {
	const teokset = await db('keskusdivari.LuokanMyynnissaOlevatTeoksetDivari as lmot')
		.select('lmot.luokka', 'lmot.lkmMyynnissa', 'lmot.lkmTeoksia', 'lmot.kokonaisMyyntihinta', 'lmot.keskiMyyntihinta')
		.where('lmot.divariId', divariId);
	return teokset;
};

// Hae kaikki keskusdivarissa myynnissä olevat teokset luokittain.
export const haeLuokanMyynnissaOlevatTeoksetKeskusdivari = async () => {
	const teokset = await db('keskusdivari.LuokanMyynnissaOlevatTeoksetKeskusdivari as lmot').select(
		'lmot.luokka',
		'lmot.lkmMyynnissa',
		'lmot.lkmTeoksia',
		'lmot.kokonaisMyyntihinta',
		'lmot.keskiMyyntihinta'
	);
	return teokset;
};

// Hae teokset annetuilla hakusanoilla keskusdivarista. Hakusanat sisältää kentät: nimi, tekija, luokka, tyyppi.
export const haeTeoksetHakusanalla = async (hakusanat: any) => {
	// Jaetaan hakusanat osiin
	const nimiSanat = hakusanat.nimi ? hakusanat.nimi.split(/\s+/).filter(Boolean) : [];
	const tekijaSanat = hakusanat.tekija ? hakusanat.tekija.split(/\s+/).filter(Boolean) : [];

	// Lasketaan osumien määrä hakusanojen perusteella
	const osumaLaskuriOsat: string[] = [];
	const osumaArvot: string[] = [];

	// Lisätään laskuriin osumat nimelle ja tekijälle
	nimiSanat.forEach((sana: string) => {
		osumaLaskuriOsat.push(`CASE WHEN LOWER(t.nimi) LIKE '%' || LOWER(?) || '%' THEN 1 ELSE 0 END`);
		osumaArvot.push(sana);
	});

	tekijaSanat.forEach((sana: string) => {
		osumaLaskuriOsat.push(`CASE WHEN LOWER(t.tekija) LIKE '%' || LOWER(?) || '%' THEN 1 ELSE 0 END`);
		osumaArvot.push(sana);
	});

	// Rakennetaan kysely
	const query = db('keskusdivari.Teos as t')
		.select(
			't.teosId',
			't.isbn',
			't.nimi',
			't.tekija',
			'ty.nimi as tyyppi',
			'l.nimi as luokka',
			't.julkaisuvuosi',
			db.raw(`(${osumaLaskuriOsat.join(' + ') || '0'}) AS osumien_maara`, osumaArvot)
		)
		.leftJoin('keskusdivari.Tyyppi as ty', 't.tyyppiId', 'ty.tyyppiId')
		.leftJoin('keskusdivari.Luokka as l', 't.luokkaId', 'l.luokkaId');

	// Filtteröidään tuloksista pois teokset, joissa tyyppi ja luokka eivät vastaa annettuja
	if (hakusanat.tyyppi) {
		query.whereRaw('LOWER(ty.nimi) = LOWER(?)', [hakusanat.tyyppi]);
	}

	if (hakusanat.luokka) {
		query.whereRaw('LOWER(l.nimi) = LOWER(?)', [hakusanat.luokka]);
	}

	// Haetaan vain teokset, joissa on osumia nimen mukaan
	if (nimiSanat.length > 0) {
		query.where(function () {
			nimiSanat.forEach((sana: string, i: number) => {
				if (i === 0) {
					this.whereRaw(`LOWER(t.nimi) LIKE '%' || LOWER(?) || '%'`, [sana]);
				} else {
					this.orWhereRaw(`LOWER(t.nimi) LIKE '%' || LOWER(?) || '%'`, [sana]);
				}
			});
		});
	}

	// Haetaan vain teokset, joissa on osumia tekijän mukaan
	if (tekijaSanat.length > 0) {
		query.where(function () {
			tekijaSanat.forEach((sana: string, i: number) => {
				if (i === 0) {
					this.whereRaw(`LOWER(t.tekija) LIKE '%' || LOWER(?) || '%'`, [sana]);
				} else {
					this.orWhereRaw(`LOWER(t.tekija) LIKE '%' || LOWER(?) || '%'`, [sana]);
				}
			});
		});
	}

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

// Hae teoksen vapaat instanssit teosID:n perusteella keskusdivarista
export const haeTeoksenVapaatInstanssit = async (teosId: string) => {
	const instanssit = await db('keskusdivari.TeosInstanssi as ti')
		.select('ti.teosInstanssiId', 'ti.hinta', 'ti.tila', 'ti.kunto', 'd.nimi as divari')
		.join('keskusdivari.Divari as d', 'ti.divariId', 'd.divariId')
		.where('ti.teosId', teosId)
		.where('ti.tila', 'vapaa');

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
