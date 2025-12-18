import 'dotenv/config';
import axios from 'axios';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const API_BASE = 'https://api.hubapi.com';

async function checkDealsDataMore() {
    try {
        const response = await axios.get(`${API_BASE}/crm/v3/objects/deals`, {
            headers: { 'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}` },
            params: {
                limit: 10,
                properties: 'dealname,product_line,carrier_group,policy_type,dealtype'
            }
        });

        console.log('--- SAMPLE DEALS DATA ---');
        response.data.results.forEach(deal => {
            console.log(`Deal: ${deal.properties.dealname}`);
            console.log(`  Product Line: ${deal.properties.product_line}`);
            console.log(`  Policy Type: ${deal.properties.policy_type}`);
            console.log(`  Deal Type (HubSpot): ${deal.properties.dealtype}`);
            console.log(`  Carrier Group: ${deal.properties.carrier_group}`);
            console.log('---');
        });
    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

checkDealsDataMore();
