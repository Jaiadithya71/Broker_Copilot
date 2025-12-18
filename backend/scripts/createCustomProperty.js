import 'dotenv/config';
import axios from 'axios';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const API_BASE = 'https://api.hubapi.com';

async function createCustomProperty() {
    try {
        console.log('🏗️ Attempting to create custom broker_product_line property...');
        await axios.post(`${API_BASE}/crm/v3/properties/deals`, {
            name: 'broker_product_line',
            label: 'Broker Product Line',
            type: 'string',
            fieldType: 'text',
            groupName: 'dealinformation'
        }, {
            headers: {
                'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Created successfully!');
        return true;
    } catch (err) {
        console.error('❌ Failed to create custom property:', err.response?.data?.message || err.message);
        return false;
    }
}

createCustomProperty();
