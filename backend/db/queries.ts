import db from './knex';
import { Haku } from '../controllers/teosController';

export const testaaHakuja = async () => {
	//console.log('Teoksia nimellä:', await haeTeoksiaKeskusdivarista('Turms kuolematon'));
	console.log('Luokka myynnissä:', await haeLuokanMyynnissaOlevatTeokset());
	//console.log('Teokset hakusanalla:', await haeTeoksetHakusanalla('Turms kuolematon'));
	console.log('Asiakkaan tilaukset:', await haeAsiakkaanTilaukset(1));
	console.log('Teokset hakusanalla 2:', await haeTeoksetHakusanalla({ nimi: 'Turms', tekija: null, luokka: null, tyyppi: null }));
};

// R2
export const haeLuokanMyynnissaOlevatTeokset = async () => {
	const teokset = await db('keskusdivari.LuokanMyynnissaOlevatTeokset as lmot').select(
		'lmot.luokka',
		'lmot.lkmMyynnissa',
		'lmot.kokonaisMyyntihinta',
		'lmot.keskiMyyntihinta'
	);
	return teokset;
};

// R4
export const haeTeoksetHakusanalla = async (hakusanat: Haku) => {
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
		query.whereRaw(hakuEhdot.join(' OR '), hakuArvot);
	}

	query
		.groupBy('t.teosId', 't.isbn', 't.nimi', 't.tekija', 'ty.nimi', 'l.nimi', 't.julkaisuvuosi')
		.orderBy([{ column: 'osumien_maara', order: 'desc' }, { column: 't.nimi' }]);

	return query;
};

// Asiakkaan tilaukset
export const haeAsiakkaanTilaukset = async (kayttajaId: number) => {
	const tilaukset = await db('keskusdivari.Tilaus as t')
		.select('k.kayttajaId as kayttajaId', 'k.nimi as asiakas_nimi', 't.tilausId', 't.tilauspvm', 't.kokonaishinta', 't.postikulut')
		.join('keskusdivari.Kayttaja as k', 'k.kayttajaId', 't.kayttajaId')
		.where('k.kayttajaId', kayttajaId);

	return tilaukset;
};

// Teoksen instanssit
export const haeTeoksenInstanssit = async (teosId: string) => {
	const instanssit = await db('keskusdivari.TeosInstanssi as ti')
		.select('ti.teosInstanssiId', 'ti.hinta', 'ti.tila', 'ti.kunto', 'd.nimi as divari')
		.join('keskusdivari.Divari as d', 'ti.divariId', 'd.divariId')
		.where('ti.teosId', teosId);

	return instanssit;
};

// Käyttäjän haku emaililla
export const haeKayttajaEmaililla = async (email: string) => {
	const kayttaja = await db('keskusdivari.Kayttaja').where('email', email).first();
	return kayttaja;
};

// Tarkista onko käyttäjää olemassa puhelinnumerolla tai emaililla
export const haeKayttajaOlemassa = async (puhelin: string, email: string): Promise<boolean> => {
	const kayttaja = await db('keskusdivari.Kayttaja').where('puhelin', puhelin).orWhere('email', email).first();
	return kayttaja !== undefined;
};

// Lisää uusi käyttäjä
export const lisaaKayttaja = async (email: string, salasana: string, nimi: string, osoite: string, puhelin: string) => {
	await db('keskusdivari.Kayttaja').insert({ email, salasana, nimi, osoite, puhelin });
};

// // R4
// export const haeTeoksetHakusanalla = async (hakusana: string) => {
// 	const teokset = await db
// 		.select(
// 			't.teosId',
// 			't.isbn',
// 			't.nimi',
// 			't.tekija',
// 			'ty.nimi as tyyppi',
// 			'l.nimi as luokka',
// 			't.julkaisuvuosi',
// 			db.raw('COUNT(h.sana) as osumien_maara')
// 		)
// 		.from('keskusdivari.Teos as t')
// 		.joinRaw(
// 			`LEFT JOIN (SELECT unnest(string_to_array(?, ' ')) AS sana) AS h
//             ON LOWER(t.nimi) LIKE '%' || LOWER(h.sana) || '%'`,
// 			[hakusana]
// 		)
// 		.leftJoin('keskusdivari.Tyyppi as ty', 't.tyyppiId', 'ty.tyyppiId')
// 		.leftJoin('keskusdivari.Luokka as l', 't.luokkaId', 'l.luokkaId')
// 		.groupBy('t.teosId', 't.isbn', 't.nimi', 't.tekija', 'ty.nimi', 'l.nimi', 't.julkaisuvuosi')
// 		.orderBy([{ column: 'osumien_maara', order: 'desc' }, { column: 't.nimi' }]);

// 	return teokset;
// };

// R1
// export const haeTeoksiaKeskusdivarista = async (nimi: string) => {
// 	const teokset = await db('keskusdivari')
// 		.select(
// 			'hn.divariNimi',
// 			'hn.isbn',
// 			'hn.nimi',
// 			'hn.tyyppi',
// 			'hn.tekija',
// 			'hn.luokka',
// 			db.raw('COUNT(*) as instanssien_maara'),
// 			db.raw('AVG(hn.hinta) as keskihinta')
// 		)
// 		.from('keskusdivari.HakuNakyma as hn')
// 		.where(db.raw('LOWER(hn.nimi)'), 'like', `%${nimi.toLowerCase()}%`)
// 		.groupBy('hn.id', 'hn.divariNimi', 'hn.isbn', 'hn.nimi', 'hn.tekija', 'hn.tyyppi', 'hn.luokka');

// 	return teokset;
// };
