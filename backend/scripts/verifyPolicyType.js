import 'dotenv/config';
import axios from 'axios';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const API_BASE = 'https://api.hubapi.com';

async function verifyPolicyType() {
    try {
        const response = await axios.get(`${API_BASE}/crm/v3/properties/deals/policy_type`, {
            headers: { 'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}` }
        });

        console.log('--- PROPERTY: policy_type ---');
        console.log(`Type: ${response.data.type} | FieldType: ${response.data.fieldType}`);
    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

verifyPolicyType();
