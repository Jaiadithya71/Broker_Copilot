import 'dotenv/config';
import axios from 'axios';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const API_BASE = 'https://api.hubapi.com';

async function convertPropertyToText() {
    try {
        console.log('🗑️ Deleting existing product_line property...');
        try {
            await axios.delete(`${API_BASE}/crm/v3/properties/deals/product_line`, {
                headers: { 'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}` }
            });
            console.log('✅ Deleted.');
        } catch (e) {
            console.warn('⚠️ Delete failed (maybe already gone):', e.message);
        }

        console.log('🏗️ Recreating product_line as a text property...');
        await axios.post(`${API_BASE}/crm/v3/properties/deals`, {
            name: 'product_line',
            label: 'Product Line',
            type: 'string',
            fieldType: 'text',
            groupName: 'dealinformation'
        }, {
            headers: {
                'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Recreated as text!');

    } catch (err) {
        console.error('❌ Error updating property:', err.response?.data || err.message);
    }
}

convertPropertyToText();
