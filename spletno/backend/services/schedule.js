import cron from 'node-cron';
import { fetchPOIData } from './fetchFromAPI.js';

export const schedulePOIFetch = () => {
    fetchPOIData().then(() => {
        console.log('Initial POI data fetched');
    }).catch((err) => {
        console.error('Failed to fetch initial POI data:', err);
    });

    cron.schedule('0 * * * *', async () => { //nastavi na ('* * * * *') za vsako minuto
        await fetchPOIData();
    });
    console.log('Scheduled POI fetch every hour');
};