import db from './knex';

export const testaaHakuja = async () => {
    console.log("Teoksia nimellä:", await haeTeoksiaKeskusdivarista("Turms kuolematon"));
    console.log("Luokka myynnissä:", await haeLuokanMyynnissaOlevatTeokset('Historia'));
    console.log("Teokset hakusanalla:", await haeTeoksetHakusanalla('Turms kuolematon'));
    console.log("Asiakkaan tilaukset:", await haeAsiakkaanTilaukset(1));
}
// R1
export const haeTeoksiaKeskusdivarista = async (nimi: string) => {
	const teokset = await db('keskusdivari')
		.select(
			'hn.divariNimi',
			'hn.isbn',
			'hn.nimi',
			'hn.tyyppi',
			'hn.tekija',
			'hn.luokka',
			db.raw('COUNT(*) as instanssien_maara'),
			db.raw('AVG(hn.hinta) as keskihinta')
		)
		.from('keskusdivari.HakuNakyma as hn')
		.where(db.raw('LOWER(hn.nimi)'), 'like', `%${nimi.toLowerCase()}%`)
		.groupBy('hn.id', 'hn.divariNimi', 'hn.isbn', 'hn.nimi', 'hn.tekija', 'hn.tyyppi', 'hn.luokka');

	return teokset;
};

// R2
export const haeLuokanMyynnissaOlevatTeokset = async (luokka: string) => {
	const teokset = await db('keskusdivari.LuokanMyynnissaOlevatTeokset as lmot')
		.select('lmot.lkmMyynnissa', 'lmot.kokonaisMyyntihinta', 'lmot.keskiMyyntihinta')
		.where('luokka', luokka);
	return teokset;
};

// R4
export const haeTeoksetHakusanalla = async (hakusana: string) => {
    const teokset = await db
        .select(
            't.teosId',
            't.isbn',
            't.nimi',
            't.tekija',
            'ty.nimi as tyyppi',
            'l.nimi as luokka',
            't.julkaisuvuosi',
            db.raw('COUNT(h.sana) as osumien_maara')
        )
        .from('keskusdivari.Teos as t')
        .joinRaw(
            `LEFT JOIN (SELECT unnest(string_to_array(?, ' ')) AS sana) AS h 
            ON LOWER(t.nimi) LIKE '%' || LOWER(h.sana) || '%'`,
            [hakusana]
        )
        .leftJoin('keskusdivari.Tyyppi as ty', 't.tyyppiId', 'ty.tyyppiId')
        .leftJoin('keskusdivari.Luokka as l', 't.luokkaId', 'l.luokkaId')
        .groupBy('t.teosId', 't.isbn', 't.nimi', 't.tekija', 'ty.nimi', 'l.nimi', 't.julkaisuvuosi')
        .orderBy([{ column: 'osumien_maara', order: 'desc' }, { column: 't.nimi' }]);

    return teokset;
};


// Asiakkaan tilaukset
export const haeAsiakkaanTilaukset = async (kayttajaId: number) => {
	const tilaukset = await db('keskusdivari.Tilaus as t')
		.select('k.kayttajaId as kayttajaId', 'k.nimi as asiakas_nimi', 't.tilausId', 't.tilauspvm', 't.kokonaishinta', 't.postikulut')
		.join('keskusdivari.Kayttaja as k', 'k.kayttajaId', 't.kayttajaId')
		.where('k.kayttajaId', kayttajaId);

	return tilaukset;
};
