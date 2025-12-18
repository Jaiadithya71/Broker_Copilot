import 'dotenv/config';
import axios from 'axios';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const API_BASE = 'https://api.hubapi.com';

async function checkDescription() {
    try {
        const response = await axios.get(`${API_BASE}/crm/v3/properties/deals/description`, {
            headers: { 'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}` }
        });

        console.log('--- PROPERTY: description ---');
        console.log(`Type: ${response.data.type} | FieldType: ${response.data.fieldType}`);
    } catch (err) {
        console.warn('⚠️ description property not found or error:', err.response?.data?.message || err.message);
    }
}

checkDescription();
