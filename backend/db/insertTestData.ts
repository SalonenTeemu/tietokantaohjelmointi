import bcrypt from 'bcrypt';
import db from './knex';
import { keskusdivari, divarit as divariSkeemat } from './initDb';

// Funktio salasanan hashaukseen bcryptillä
const hashSalasana = async (salasana: string) => {
	return await bcrypt.hash(salasana, 10);
};

// Alustava tietokannan testidata ohjelman testausta varten:

// Käyttäjät
const kayttajat = [
	{
		nimi: 'Admin Admin',
		osoite: 'Admintie 1',
		puhelin: '0401234567',
		email: 'admin@email.com',
		salasana: await hashSalasana('salasana'),
		rooli: 'admin',
	},
	{
		nimi: 'Divarin 1 omistaja',
		osoite: 'Asiakastie 1',
		puhelin: '0407654321',
		email: 'divari1@email.com',
		salasana: await hashSalasana('salasana'),
		rooli: 'divariAdmin',
	},
	{
		nimi: 'Divarin 2 omistaja',
		osoite: 'Asiakastie 2',
		puhelin: '0407654322',
		email: 'divari2@email.com',
		salasana: await hashSalasana('salasana'),
		rooli: 'divariAdmin',
	},
	{
		nimi: 'Divarin 3 omistaja',
		osoite: 'Asiakastie 3',
		puhelin: '0407654323',
		email: 'divari3@email.com',
		salasana: await hashSalasana('salasana'),
		rooli: 'divariAdmin',
	},
	{
		nimi: 'Asiakas 1',
		osoite: 'Asiakastie 4',
		puhelin: '0407654324',
		email: 'asiakas@email.com',
		salasana: await hashSalasana('salasana'),
	},
];

// Divarit
const divarit = [
	{ nimi: 'Keskusdivari', osoite: 'Keskusdivarintie 1', webSivu: 'www.keskusdivari.fi', onKeskusdivari: true, omaTietokanta: 'keskusdivari' },
	{ nimi: 'Divari 1', osoite: 'Divarintie 1', omaTietokanta: 'd1' },
	{ nimi: 'Divari 2', osoite: 'Divarintie 2' },
	{ nimi: 'Divari 3', osoite: 'Divarintie 3', omaTietokanta: 'd3' },
];

// Luokat teoksille
const luokat = [
	{ nimi: 'Seikkailu' },
	{ nimi: 'Sikailu' },
	{ nimi: 'Romantiikka' },
	{ nimi: 'Historia' },
	{ nimi: 'Dekkari' },
	{ nimi: 'Huumori' },
	{ nimi: 'Opas' },
];

// Tyypit teoksille
const tyypit = [{ nimi: 'Romaani' }, { nimi: 'Sarjakuva' }, { nimi: 'Tietokirja' }];

// Postitusmaksut
const postitusHinnasto = [
	{ paino: 50, hinta: 2.5 },
	{ paino: 250, hinta: 5.0 },
	{ paino: 1000, hinta: 10.0 },
	{ paino: 2000, hinta: 15.0 },
];

// Divari-adminit
const divariAdminit = [
	{ divariId: 1, kayttajaId: 1 },
	{ divariId: 2, kayttajaId: 2 },
	{ divariId: 3, kayttajaId: 3 },
	{ divariId: 4, kayttajaId: 4 },
];

// Teokset
const teokset = [
	{
		teosId: '03d2c3b6-f2c4-41c4-a105-9f2bb01dbacd',
		nimi: 'Elektran tytär',
		tekija: 'Madeleine Brent',
		isbn: '9155430674',
		julkaisuvuosi: 1986,
		paino: 500,
		luokkaId: 3,
		tyyppiId: 1,
	},
	{
		teosId: '03d2c3b7-f2c4-41c4-a105-9f2bb01dbacd',
		nimi: 'Tuulentavoittelijan morsian',
		tekija: 'Madeleine Brent',
		isbn: '9156381451',
		julkaisuvuosi: 1978,
		paino: 500,
		luokkaId: 3,
		tyyppiId: 1,
	},
	{
		teosId: '8a9a88c7-3487-47d5-a73d-1bfcfbaa17ef',
		nimi: 'Turms kuolematon',
		tekija: 'Mika Waltari',
		isbn: null,
		julkaisuvuosi: 1995,
		paino: 500,
		luokkaId: 4,
		tyyppiId: 1,
	},
	{
		teosId: '5c68c167-3770-456e-9385-6d58abdce0d5',
		nimi: 'Komisario Palmun erehdys',
		tekija: 'Mika Waltari',
		isbn: null,
		julkaisuvuosi: 1940,
		paino: 500,
		luokkaId: 5,
		tyyppiId: 1,
	},
	{
		teosId: '0fbca8b4-db20-4330-88e5-b76461d32110',
		nimi: 'Friikkilän pojat Mexicossa',
		tekija: 'Shelton Gilbert',
		isbn: null,
		julkaisuvuosi: 1989,
		paino: 500,
		luokkaId: 6,
		tyyppiId: 2,
	},
	{
		teosId: 'f3b3b3b4-1b3b-4b3b-8b3b-3b3b3b3b3b3b',
		nimi: 'Miten saan ystäviä, menestystä, vaikutusvaltaa',
		tekija: 'Dale Carnegien',
		isbn: '9789510396230',
		julkaisuvuosi: 1939,
		paino: 500,
		luokkaId: 7,
		tyyppiId: 3,
	},
];

// Teosinstanssit keskusdivarissa, joista osa liitetty tilauksiin
const teosInstanssit = [
	{ hinta: 10.0, kunto: 'kohtalainen', sisaanostohinta: 5.0, teosId: '03d2c3b6-f2c4-41c4-a105-9f2bb01dbacd', divariId: 2 },
	{ hinta: 10.0, kunto: 'kohtalainen', sisaanostohinta: 6.0, teosId: '03d2c3b6-f2c4-41c4-a105-9f2bb01dbacd', divariId: 2 },
	{ hinta: 15.0, kunto: 'heikko', sisaanostohinta: 7.0, teosId: '8a9a88c7-3487-47d5-a73d-1bfcfbaa17ef', divariId: 2 },
	{ hinta: 35.0, kunto: 'erinomainen', sisaanostohinta: 17.0, teosId: '5c68c167-3770-456e-9385-6d58abdce0d5', divariId: 4 },
	{ hinta: 10.0, kunto: 'kohtalainen', sisaanostohinta: 5.0, teosId: '03d2c3b6-f2c4-41c4-a105-9f2bb01dbacd', divariId: 2, tilausId: 1 },
	{ hinta: 10.0, kunto: 'kohtalainen', sisaanostohinta: 6.0, teosId: '03d2c3b6-f2c4-41c4-a105-9f2bb01dbacd', divariId: 2, tilausId: 1 },
	{ hinta: 15.0, kunto: 'heikko', sisaanostohinta: 7.0, teosId: '8a9a88c7-3487-47d5-a73d-1bfcfbaa17ef', divariId: 2, tilausId: 2 },
	{ hinta: 35.0, kunto: 'erinomainen', sisaanostohinta: 17.0, teosId: '5c68c167-3770-456e-9385-6d58abdce0d5', divariId: 4, tilausId: 3 },
];

// Divarin 1 teosinstanssit
const teosInstanssitD1 = [
	{ hinta: 10.0, kunto: 'kohtalainen', sisaanostohinta: 5.0, teosId: '03d2c3b6-f2c4-41c4-a105-9f2bb01dbacd' },
	{ hinta: 10.0, kunto: 'kohtalainen', sisaanostohinta: 6.0, teosId: '03d2c3b6-f2c4-41c4-a105-9f2bb01dbacd' },
	{ hinta: 15.0, kunto: 'heikko', sisaanostohinta: 7.0, teosId: '8a9a88c7-3487-47d5-a73d-1bfcfbaa17ef' },
	{ hinta: 10.0, kunto: 'kohtalainen', sisaanostohinta: 5.0, teosId: '03d2c3b6-f2c4-41c4-a105-9f2bb01dbacd' },
	{ hinta: 10.0, kunto: 'kohtalainen', sisaanostohinta: 6.0, teosId: '03d2c3b6-f2c4-41c4-a105-9f2bb01dbacd' },
	{ hinta: 15.0, kunto: 'heikko', sisaanostohinta: 7.0, teosId: '8a9a88c7-3487-47d5-a73d-1bfcfbaa17ef' },
];

// Divarin 3 teosinstanssit
const teosInstanssitD3 = [
	{ hinta: 35.0, kunto: 'erinomainen', sisaanostohinta: 17.0, teosId: '5c68c167-3770-456e-9385-6d58abdce0d5' },

	{ hinta: 35.0, kunto: 'erinomainen', sisaanostohinta: 17.0, teosId: '5c68c167-3770-456e-9385-6d58abdce0d5' },
];

// Tilaukset, joihin on liitetty teosinstansseja
const tilaukset = [
	{ tila: 'valmis', tilauspvm: '2025-03-01', postikulut: 5.0, kokonaishinta: 50.0, kayttajaId: 5 },
	{ tila: 'valmis', tilauspvm: '2024-03-18', postikulut: 10.0, kokonaishinta: 100.0, kayttajaId: 5 },
	{ tila: 'valmis', tilauspvm: '2024-03-17', postikulut: 15.0, kokonaishinta: 10000.0, kayttajaId: 5 },
];

// Lisää testidata tietokantaan
export const lisaaTestidata = async () => {
	try {
		await db.transaction(async (trx) => {
			await trx(`${keskusdivari}.Kayttaja`).insert(kayttajat);
			await trx(`${keskusdivari}.Divari`).insert(divarit);
			await trx(`${keskusdivari}.Luokka`).insert(luokat);
			await trx(`${keskusdivari}.Tyyppi`).insert(tyypit);
			await trx(`${keskusdivari}.PostitusHinnasto`).insert(postitusHinnasto);
		});
		await db.transaction(async (trx) => {
			await trx(`${keskusdivari}.Teos`).insert(teokset);
			await trx(`${keskusdivari}.Divari_Admin`).insert(divariAdminit);
			await trx(`${keskusdivari}.Tilaus`).insert(tilaukset);
			await trx(`${keskusdivari}.TeosInstanssi`).insert(teosInstanssit);
		});
		for (const divari of divariSkeemat) {
			await db.transaction(async (trx) => {
				await trx(`${divari}.Luokka`).insert(luokat);
				await trx(`${divari}.Tyyppi`).insert(tyypit);
				await trx(`${divari}.Teos`).insert(teokset);
			});
		}
		for (const divari of divariSkeemat) {
			await db.transaction(async (trx) => {
				if (divari == 'd1') {
					await trx(`${divari}.TeosInstanssi`).insert(teosInstanssitD1);
				} else if (divari == 'd3') {
					await trx(`${divari}.TeosInstanssi`).insert(teosInstanssitD3);
				}
			});
		}

		console.log('Testidata lisätty onnistuneesti');
	} catch {
		console.error('Tietokannassa oli jo testidataa.');
	}
};
