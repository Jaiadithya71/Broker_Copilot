import 'dotenv/config';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const API_BASE = 'https://api.hubapi.com';

if (!HUBSPOT_ACCESS_TOKEN) {
    console.error('❌ HUBSPOT_ACCESS_TOKEN not found');
    process.exit(1);
}

const headers = {
    'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
};

// Simple CSV parser
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t') ? '\t' : ',';
    const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));

    const records = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
        const record = {};
        headers.forEach((header, index) => {
            record[header] = values[index] || '';
        });
        records.push(record);
    }
    return records;
}

async function repairHubSpotData() {
    try {
        const csvPath = path.join(__dirname, '../data/renewals.csv');
        console.log(`📖 Reading CSV from ${csvPath}...`);
        const csvText = fs.readFileSync(csvPath, 'utf-8');
        const records = parseCSV(csvText);
        console.log(`✅ Parsed ${records.length} records from CSV`);

        // Create a map for quick lookup: Enrollment Name -> Record
        const csvMap = new Map();
        records.forEach(r => {
            if (r['Placement Name']) {
                csvMap.set(r['Placement Name'], r);
            }
        });

        console.log('📦 Fetching deals from HubSpot...');
        const dealsResponse = await axios.get(`${API_BASE}/crm/v3/objects/deals`, {
            headers,
            params: { limit: 100, properties: 'dealname' }
        });

        const deals = dealsResponse.data.results || [];
        console.log(`🔍 Hubspot has ${deals.length} deals. Starting repair...`);

        let updatedCount = 0;
        for (const deal of deals) {
            const dealName = deal.properties.dealname;
            const csvRecord = csvMap.get(dealName);

            if (csvRecord) {
                console.log(`🛠️ Repairing deal: ${dealName} (${csvRecord['Product Line']})`);

                try {
                    await axios.patch(
                        `${API_BASE}/crm/v3/objects/deals/${deal.id}`,
                        {
                            properties: {
                                product_line: csvRecord['Product Line'],
                                carrier_group: csvRecord['Carrier Group'],
                                client_name: csvRecord['Client']
                            }
                        },
                        { headers }
                    );
                    updatedCount++;
                    // Rate limit protection
                    await new Promise(res => setTimeout(res, 300));
                } catch (err) {
                    console.error(`❌ Failed to update ${dealName}:`, err.response?.data || err.message);
                }
            }
        }

        console.log(`\n✨ REPAIR COMPLETE!`);
        console.log(`✅ Updated ${updatedCount} deals with accurate Product Lines and Carrier Groups.`);

    } catch (err) {
        console.error('Fatal Error:', err.message);
    }
}

repairHubSpotData();
