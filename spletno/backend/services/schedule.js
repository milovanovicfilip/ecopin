import cron from 'node-cron';
import { fetchPOIData } from './fetchFromAPI.js';

export const schedulePOIFetch = () => {
    cron.schedule('0 * * * *', async () => { //nastavi na ('* * * * *') za vsako minuto
        await fetchPOIData();
    });
    console.log('Scheduled POI fetch every hour');
};