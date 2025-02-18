import db from './knex';

const keskusdivari = 'keskusdivari';
const divarit = ['d1', 'd3'];

// Testaa yhteyttä tietokantaan ja luo skeemat onnistuessaan
export const initializeDatabase = async () => {
    try {
        await db.raw('SELECT 1');
        console.log('Yhteys tietokantaan onnistui');
        
        await createSchemas();
        await createTypes();
        await createKeskusDivariTables();

        for (const divari of divarit) {
            await createDivariTables(divari);
        }
        console.log('Tietokantataulut luotu onnistuneesti');
    } catch (err: unknown) {
        console.error('Virhe yhteydenotossa tai taulujen luonnissa:', err);
    }
};

// Luo skeemat, jos niitä ei ole olemassa
const createSchemas = async () => {
    await db.schema.createSchemaIfNotExists(keskusdivari);
    for (const divari of divarit) {
        await db.schema.createSchemaIfNotExists(divari);
    }
};

// Luo tietokantatyypit keskusdivarille, jos niitä ei ole olemassa
const createTypes = async () => {
    await createTypeIfNotExists('kayttajarooli', "ENUM ('asiakas', 'admin')");
    await createTypeIfNotExists('teoskunto', "ENUM ('heikko', 'kohtalainen', 'erinomainen')");
    await createTypeIfNotExists('tilaustila', "ENUM ('kesken', 'valmis')");
    await createTypeIfNotExists('teostila', "ENUM ('vapaa', 'varattu', 'myyty')");
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
const createKeskusDivariTables = async () => {
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
            table.boolean('omaTietokanta').defaultTo(false).notNullable();
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
            table.uuid('teosId').notNullable().references('teosId').inTable(`${keskusdivari}.Teos`);
            table.integer('tilausId').references('tilausId').inTable(`${keskusdivari}.Tilaus`);
            table.integer('divariId').notNullable().references('divariId').inTable(`${keskusdivari}.Divari`);
        });
    }
};

// Luo divarin taulut, jos niitä ei ole olemassa
const createDivariTables = async (divari: string) => {
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