import 'dotenv/config';
import axios from 'axios';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const API_BASE = 'https://api.hubapi.com';

async function verifyPropertyType() {
    try {
        const response = await axios.get(`${API_BASE}/crm/v3/properties/deals/product_line`, {
            headers: { 'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}` }
        });

        console.log('--- PROPERTY: product_line ---');
        console.log(`Label: ${response.data.label}`);
        console.log(`Type: ${response.data.type}`);
        console.log(`FieldType: ${response.data.fieldType}`);
        if (response.data.options) {
            console.log('Options:');
            response.data.options.forEach(o => console.log(` - ${o.label} (Value: ${o.value})`));
        }
    } catch (err) {
        console.error('Error fetching product_line:', err.response?.data || err.message);
    }
}

verifyPropertyType();
