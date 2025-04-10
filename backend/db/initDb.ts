import db from './knex';
import { lisaaTestidata, lisaaDivariTestiData } from './insertTestData';
import { luoNakymat } from './views';

// Skeemat keskusdivarille ja yksittäisille divareille
export const keskusdivari = 'keskusdivari';
export const divarit = ['d1', 'd3'];

// Testaa yhteyttä tietokantaan ja luo skeemat, näkymät, tyypit, taulut ja triggerit jos yhteys onnistuu
export const alustaTietokanta = async () => {
	try {
		await db.raw('SELECT 1');
		console.log('Yhteys tietokantaan onnistui');

		await luoSkeemat();
		await luoTyypit();
		await luoKeskusdivarinTaulut();

		for (const divari of divarit) {
			await luoDivarintaulut(divari);
		}
		console.log('Tietokantataulut luotu onnistuneesti');
		await luoNakymat();
		await lisaaDivariTestiData();
		for (const divari of divarit) {
			await luoInstanssiTriggeri(divari);
		}
		await luoInstanssinTilaTriggeri();
		await luoInstanssinMyyntiPvmTriggeri();
		await lisaaTestidata();
	} catch (err: unknown) {
		console.error('Virhe yhteydenotossa tai taulujen luonnissa:', err);
	}
};

// Luo skeemat, jos niitä ei ole olemassa
const luoSkeemat = async () => {
	await db.schema.createSchemaIfNotExists(keskusdivari);
	for (const divari of divarit) {
		await db.schema.createSchemaIfNotExists(divari);
	}
};

// Luo tietokantatyypit keskusdivarille, jos niitä ei ole olemassa
const luoTyypit = async () => {
	await createTypeIfNotExists('kayttajarooli', "ENUM ('asiakas', 'divariAdmin', 'admin')");
	await createTypeIfNotExists('teoskunto', "ENUM ('heikko', 'kohtalainen', 'erinomainen')");
	await createTypeIfNotExists('tilaustila', "ENUM ('kesken', 'peruutettu', 'valmis')");
	await createTypeIfNotExists('teostila', "ENUM ('vapaa', 'ostoskorissa', 'varattu', 'myyty')");
};

// Luo tietokantatyyppi, jos sitä ei ole olemassa
const createTypeIfNotExists = async (tyyppi: string, nimi: string) => {
	const typeExists = await db.raw(`
        SELECT EXISTS (
            SELECT 1 
            FROM pg_type 
            WHERE typname = '${tyyppi}'
        );
    `);
	if (!typeExists.rows[0].exists) {
		await db.raw(`CREATE TYPE ${tyyppi} AS ${nimi};`);
	}
};

// Luo keskusdivarin taulut, jos niitä ei ole olemassa
const luoKeskusdivarinTaulut = async () => {
	if (!(await db.schema.withSchema(keskusdivari).hasTable('Kayttaja'))) {
		await db.schema.withSchema(keskusdivari).createTable('Kayttaja', (table) => {
			table.increments('kayttajaId').primary();
			table.string('nimi', 100).notNullable();
			table.string('osoite', 255).notNullable();
			table.string('puhelin', 20).unique().notNullable();
			table.string('email', 255).unique().notNullable();
			table.string('salasana', 255).notNullable();
			table.specificType('rooli', 'kayttajarooli').defaultTo('asiakas');
		});
	}

	if (!(await db.schema.withSchema(keskusdivari).hasTable('Divari'))) {
		await db.schema.withSchema(keskusdivari).createTable('Divari', (table) => {
			table.increments('divariId').primary();
			table.string('nimi', 100).unique().notNullable();
			table.string('osoite', 255).notNullable();
			table.string('webSivu', 255);
			table.boolean('onKeskusdivari').defaultTo(false).notNullable();
			table.string('omaTietokanta', 255).defaultTo(null);
		});
	}

	if (!(await db.schema.withSchema(keskusdivari).hasTable('Tilaus'))) {
		await db.schema.withSchema(keskusdivari).createTable('Tilaus', (table) => {
			table.increments('tilausId').primary();
			table.specificType('tila', 'tilaustila').defaultTo('kesken');
			table.date('tilauspvm').notNullable();
			table.decimal('postikulut', 10, 2).notNullable();
			table.decimal('kokonaishinta', 10, 2).notNullable();
			table.integer('kayttajaId').notNullable().references('kayttajaId').inTable(`${keskusdivari}.Kayttaja`);
		});
	}

	if (!(await db.schema.withSchema(keskusdivari).hasTable('Luokka'))) {
		await db.schema.withSchema(keskusdivari).createTable('Luokka', (table) => {
			table.increments('luokkaId').primary();
			table.string('nimi', 100).notNullable();
		});
	}

	if (!(await db.schema.withSchema(keskusdivari).hasTable('Tyyppi'))) {
		await db.schema.withSchema(keskusdivari).createTable('Tyyppi', (table) => {
			table.increments('tyyppiId').primary();
			table.string('nimi', 100).notNullable();
		});
	}

	if (!(await db.schema.withSchema(keskusdivari).hasTable('PostitusHinnasto'))) {
		await db.schema.withSchema(keskusdivari).createTable('PostitusHinnasto', (table) => {
			table.increments('id').primary();
			table.integer('paino').notNullable();
			table.decimal('hinta', 10, 2).notNullable();
		});
	}

	if (!(await db.schema.withSchema(keskusdivari).hasTable('Divari_Admin'))) {
		await db.schema.withSchema(keskusdivari).createTable('Divari_Admin', (table) => {
			table.integer('kayttajaId').notNullable().references('kayttajaId').inTable(`${keskusdivari}.Kayttaja`);
			table.integer('divariId').notNullable().references('divariId').inTable(`${keskusdivari}.Divari`);
			table.primary(['kayttajaId', 'divariId']);
		});
	}

	if (!(await db.schema.withSchema(keskusdivari).hasTable('Teos'))) {
		await db.schema.withSchema(keskusdivari).createTable('Teos', (table) => {
			table.uuid('teosId').defaultTo(db.raw('gen_random_uuid()')).primary();
			table.string('nimi', 100).notNullable();
			table.string('isbn', 20).unique();
			table.string('tekija', 100).notNullable();
			table.integer('julkaisuvuosi').notNullable();
			table.integer('paino').notNullable();
			table.integer('luokkaId').notNullable().references('luokkaId').inTable(`${keskusdivari}.Luokka`);
			table.integer('tyyppiId').notNullable().references('tyyppiId').inTable(`${keskusdivari}.Tyyppi`);
		});
	}

	if (!(await db.schema.withSchema(keskusdivari).hasTable('TeosInstanssi'))) {
		await db.schema.withSchema(keskusdivari).createTable('TeosInstanssi', (table) => {
			table.uuid('teosInstanssiId').defaultTo(db.raw('gen_random_uuid()')).primary();
			table.decimal('hinta', 10, 2).notNullable();
			table.specificType('kunto', 'teoskunto');
			table.decimal('sisaanostohinta', 10, 2);
			table.date('myyntipvm');
			table.specificType('tila', 'teostila').defaultTo('vapaa');
			table.dateTime('varausaika');
			table.uuid('teosId').notNullable().references('teosId').inTable(`${keskusdivari}.Teos`);
			table.integer('tilausId').references('tilausId').inTable(`${keskusdivari}.Tilaus`);
			table.integer('divariId').notNullable().references('divariId').inTable(`${keskusdivari}.Divari`);
		});
	}
};

// Luo divarin taulut, jos niitä ei ole olemassa
const luoDivarintaulut = async (divari: string) => {
	if (!(await db.schema.withSchema(divari).hasTable('Luokka'))) {
		await db.schema.withSchema(divari).createTable('Luokka', (table) => {
			table.increments('luokkaId').primary();
			table.string('nimi', 100).notNullable();
		});
	}

	if (!(await db.schema.withSchema(divari).hasTable('Tyyppi'))) {
		await db.schema.withSchema(divari).createTable('Tyyppi', (table) => {
			table.increments('tyyppiId').primary();
			table.string('nimi', 100).notNullable();
		});
	}

	if (!(await db.schema.withSchema(divari).hasTable('Teos'))) {
		await db.schema.withSchema(divari).createTable('Teos', (table) => {
			table.uuid('teosId').defaultTo(db.raw('gen_random_uuid()')).primary();
			table.string('nimi', 100).notNullable();
			table.string('isbn', 20).unique();
			table.string('tekija', 100).notNullable();
			table.integer('julkaisuvuosi').notNullable();
			table.integer('paino').notNullable();
			table.integer('luokkaId').notNullable().references('luokkaId').inTable(`${divari}.Luokka`);
			table.integer('tyyppiId').notNullable().references('tyyppiId').inTable(`${divari}.Tyyppi`);
		});
	}

	if (!(await db.schema.withSchema(divari).hasTable('TeosInstanssi'))) {
		await db.schema.withSchema(divari).createTable('TeosInstanssi', (table) => {
			table.uuid('teosInstanssiId').defaultTo(db.raw('gen_random_uuid()')).primary();
			table.decimal('hinta', 10, 2).notNullable();
			table.specificType('kunto', 'teoskunto');
			table.decimal('sisaanostohinta', 10, 2);
			table.date('myyntipvm');
			table.specificType('tila', 'teostila').defaultTo('vapaa');
			table.uuid('teosId').notNullable().references('teosId').inTable(`${divari}.Teos`);
		});
	}
};

// Luo funktio triggerille, joka lisää instanssin keskusdivariin
const luoInstanssiTriggeriFunktio = async (divari: string) => {
	// Hae divarin id, jotta osataan lisätä instanssi oikeaan divariin keskusdivarissa
	const divariId = await db.raw(`SELECT "divariId" FROM ${keskusdivari}."Divari" WHERE "omaTietokanta" = '${divari}'`);
	await db.raw(`
        CREATE OR REPLACE FUNCTION ${divari}.lisaa_instanssi()
        RETURNS TRIGGER AS $$
        BEGIN
            INSERT INTO ${keskusdivari}."TeosInstanssi" ("teosInstanssiId", hinta, kunto, sisaanostohinta, myyntipvm, tila, "teosId", "divariId")
            VALUES (NEW."teosInstanssiId", NEW.hinta, NEW.kunto, NEW.sisaanostohinta, NEW.myyntipvm, NEW.tila, NEW."teosId", ${divariId.rows[0].divariId});
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `);
};

// Luo triggeri, joka lisää instanssin keskusdivariin
const luoInstanssiTriggeri = async (divari: string) => {
	await luoInstanssiTriggeriFunktio(divari);
	// Tarkasta, että triggeri ei ole jo olemassa
	const triggeri = await db.raw(`
        SELECT EXISTS (
            SELECT 1
            FROM pg_trigger
            WHERE tgname = 'lisaa_instanssi'
            AND tgrelid = '${divari}."TeosInstanssi"'::regclass
        );
    `);
	if (!triggeri.rows[0].exists) {
		await db.raw(`
			CREATE TRIGGER lisaa_instanssi
			AFTER INSERT ON ${divari}."TeosInstanssi"
			FOR
			EACH ROW
			EXECUTE FUNCTION ${divari}.lisaa_instanssi();
		`);
	}
};

// Luo funktio triggerille, joka päivittää instanssin tilan omassa divarissa
const luoInstanssinTilanMuutosTriggeriFunktio = async () => {
	await db.raw(`
        CREATE OR REPLACE FUNCTION ${keskusdivari}.paivita_instanssin_tila()
        RETURNS TRIGGER AS $$
        DECLARE
            divariNimi TEXT;
        BEGIN
            SELECT "omaTietokanta" INTO divariNimi
            FROM ${keskusdivari}."Divari"
            WHERE "divariId" = NEW."divariId";

            EXECUTE format('UPDATE %I."TeosInstanssi" SET "tila" = $1 WHERE "teosInstanssiId" = $2', divariNimi)
            USING NEW.tila, NEW."teosInstanssiId";

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `);
};

// Luo triggeri, joka päivittää instanssin tilan omassa divarissa
const luoInstanssinTilaTriggeri = async () => {
	await luoInstanssinTilanMuutosTriggeriFunktio();
	// Tarkasta, että triggeri ei ole jo olemassa
	const triggeri = await db.raw(`
		SELECT EXISTS (
			SELECT 1
			FROM pg_trigger
			WHERE tgname = 'paivita_instanssin_tila'
			AND tgrelid = '${keskusdivari}."TeosInstanssi"'::regclass
		);
	`);
	if (!triggeri.rows[0].exists) {
		await db.raw(`
			CREATE TRIGGER paivita_instanssin_tila
			AFTER UPDATE OF tila ON ${keskusdivari}."TeosInstanssi"
			FOR EACH ROW
			EXECUTE FUNCTION ${keskusdivari}.paivita_instanssin_tila();
		`);
	}
};

// Luo funktio triggerille, joka päivittää instanssin myyntipäivämäärän omassa divarissa
const luoInstanssinMyyntiPvmMuutosTriggeriFunktio = async () => {
	await db.raw(`
        CREATE OR REPLACE FUNCTION ${keskusdivari}.paivita_instanssin_myyntipvm()
        RETURNS TRIGGER AS $$
        DECLARE
            divariNimi TEXT;
        BEGIN
            SELECT "omaTietokanta" INTO divariNimi
            FROM ${keskusdivari}."Divari"
            WHERE "divariId" = NEW."divariId";

            EXECUTE format('UPDATE %I."TeosInstanssi" SET "myyntipvm" = $1 WHERE "teosInstanssiId" = $2', divariNimi)
            USING NEW.myyntipvm, NEW."teosInstanssiId";

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `);
};

// Luo triggeri, joka päivittää instanssin myyntipäivämäärän omassa divarissa
const luoInstanssinMyyntiPvmTriggeri = async () => {
	await luoInstanssinMyyntiPvmMuutosTriggeriFunktio();
	// Tarkasta, että triggeri ei ole jo olemassa
	const triggeri = await db.raw(`
		SELECT EXISTS (
			SELECT 1
			FROM pg_trigger
			WHERE tgname = 'paivita_instanssin_myyntipvm'
			AND tgrelid = '${keskusdivari}."TeosInstanssi"'::regclass
		);
	`);
	if (!triggeri.rows[0].exists) {
		await db.raw(`
			CREATE TRIGGER paivita_instanssin_myyntipvm
			AFTER UPDATE OF myyntipvm ON ${keskusdivari}."TeosInstanssi"
			FOR EACH ROW
			EXECUTE FUNCTION ${keskusdivari}.paivita_instanssin_myyntipvm();
		`);
	}
};
