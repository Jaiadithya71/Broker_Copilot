import 'dotenv/config';
import axios from 'axios';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const API_BASE = 'https://api.hubapi.com';

async function listProperties() {
    try {
        const response = await axios.get(`${API_BASE}/crm/v3/properties/deals`, {
            headers: { 'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}` }
        });

        const props = response.data.results;
        console.log('--- DEAL PROPERTIES ---');
        const relevant = props.filter(p =>
            p.label.toLowerCase().includes('product') ||
            p.name.toLowerCase().includes('product') ||
            p.label.toLowerCase().includes('line') ||
            p.name.toLowerCase().includes('line') ||
            p.label.toLowerCase().includes('carrier') ||
            p.name.toLowerCase().includes('carrier') ||
            p.label.toLowerCase().includes('coverage') ||
            p.name.toLowerCase().includes('coverage') ||
            p.label.toLowerCase().includes('insurance') ||
            p.name.toLowerCase().includes('insurance') ||
            p.label.toLowerCase().includes('type') ||
            p.name.toLowerCase().includes('type')
        );

        relevant.forEach(p => {
            console.log(`Label: ${p.label} | Name: ${p.name}`);
        });
    } catch (err) {
        console.error('Error fetching properties:', err.response?.data || err.message);
    }
}

listProperties();
