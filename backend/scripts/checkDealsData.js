import 'dotenv/config';
import axios from 'axios';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const API_BASE = 'https://api.hubapi.com';

async function checkDealsData() {
    try {
        const response = await axios.get(`${API_BASE}/crm/v3/objects/deals`, {
            headers: { 'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}` },
            params: {
                limit: 5,
                properties: 'dealname,product_line,carrier_group'
            }
        });

        console.log('--- SAMPLE DEALS DATA ---');
        response.data.results.forEach(deal => {
            console.log(`Deal: ${deal.properties.dealname}`);
            console.log(`  Product Line: ${deal.properties.product_line}`);
            console.log(`  Carrier Group: ${deal.properties.carrier_group}`);
            console.log('---');
        });
    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

checkDealsData();
