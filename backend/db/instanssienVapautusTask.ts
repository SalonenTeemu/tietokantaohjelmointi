import cron from 'node-cron';
import db from './knex'; 

// Tehtävä vapauttaa vanhat ostoskorivaraukset (vanhemmat kuin 15 min) joka minuutti
cron.schedule('*/1 * * * *', async () => {
    console.log('Vapautetaan vanhoja ostoskorivarauksia..');
    try {
        await db('keskusdivari.TeosInstanssi')
            .where('tila', 'ostoskorissa')
            .andWhere('varausaika', '<=', db.raw('NOW() - INTERVAL \'15 minutes\''))
            .update({
                tila: 'vapaa',
                varausaika: null,
            });

        console.log(`Varaukset vapautettu`);
    } catch (error) {
        console.error('Virhe varausten vapautuksessa', error);
    }
});