import 'dotenv/config';
import axios from 'axios';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const API_BASE = 'https://api.hubapi.com';

async function checkSingleDealFull() {
    try {
        const dealsResponse = await axios.get(`${API_BASE}/crm/v3/objects/deals`, {
            headers: { 'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}` },
            params: { limit: 1 }
        });

        if (dealsResponse.data.results.length === 0) {
            console.log('No deals found');
            return;
        }

        const dealId = dealsResponse.data.results[0].id;
        const fullDeal = await axios.get(`${API_BASE}/crm/v3/objects/deals/${dealId}`, {
            headers: { 'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}` },
            params: { propertiesWithHistory: 'dealname' } // This will return all properties by default if we don't specify
        });

        console.log('--- ALL PROPERTIES FOR DEAL: ' + dealId + ' ---');
        console.log(JSON.stringify(fullDeal.data.properties, null, 2));
    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

checkSingleDealFull();
