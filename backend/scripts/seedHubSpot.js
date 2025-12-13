import axios from 'axios';
import 'dotenv/config';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const API_BASE = 'https://api.hubapi.com';

if (!HUBSPOT_ACCESS_TOKEN) {
  console.error('❌ HUBSPOT_ACCESS_TOKEN not found in .env');
  process.exit(1);
}

const headers = {
  'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
  'Content-Type': 'application/json'
};

// Test data: Insurance renewal deals
const testDeals = [
  {
    dealname: 'Acme Manufacturing Insurance Renewal',
    amount: '850000',
    closedate: '2026-02-15',
    dealstage: 'qualifiedtobuy',
    pipeline: 'default'
  },
  {
    dealname: 'TechCorp Cyber Liability Policy',
    amount: '1250000',
    closedate: '2025-12-20',
    dealstage: 'presentationscheduled',
    pipeline: 'default'
  },
  {
    dealname: 'GreenLogistics Marine Cargo Coverage',
    amount: '420000',
    closedate: '2026-01-05',
    dealstage: 'qualifiedtobuy',
    pipeline: 'default'
  },
  {
    dealname: 'Sunrise Foods General Liability',
    amount: '315000',
    closedate: '2025-12-30',
    dealstage: 'decisionmakerboughtin',
    pipeline: 'default'
  },
  {
    dealname: 'BlueSky Consulting Professional Indemnity',
    amount: '680000',
    closedate: '2026-03-10',
    dealstage: 'qualifiedtobuy',
    pipeline: 'default'
  }
];

// Test contacts to associate with deals
const testContacts = [
  {
    firstname: 'Ananya',
    lastname: 'Sharma',
    email: 'ananya.sharma@acmemanufacturing.com',
    phone: '+91-9876543210',
    company: 'Acme Manufacturing'
  },
  {
    firstname: 'Rahul',
    lastname: 'Verma',
    email: 'rahul.verma@techcorp.com',
    phone: '+91-9876543211',
    company: 'TechCorp'
  },
  {
    firstname: 'Priya',
    lastname: 'Patel',
    email: 'priya.patel@greenlogistics.com',
    phone: '+91-9876543212',
    company: 'GreenLogistics'
  },
  {
    firstname: 'Vikram',
    lastname: 'Singh',
    email: 'vikram.singh@sunrisefoods.com',
    phone: '+91-9876543213',
    company: 'Sunrise Foods'
  },
  {
    firstname: 'Meera',
    lastname: 'Reddy',
    email: 'meera.reddy@blueskyconsulting.com',
    phone: '+91-9876543214',
    company: 'BlueSky Consulting'
  }
];

async function createContact(contact) {
  try {
    const response = await axios.post(
      `${API_BASE}/crm/v3/objects/contacts`,
      { properties: contact },
      { headers }
    );
    console.log(`✅ Created contact: ${contact.firstname} ${contact.lastname} (ID: ${response.data.id})`);
    return response.data.id;
  } catch (error) {
    if (error.response?.status === 409) {
      // Contact already exists - fetch it
      console.log(`⚠️ Contact ${contact.email} already exists, fetching...`);
      try {
        const searchResponse = await axios.post(
          `${API_BASE}/crm/v3/objects/contacts/search`,
          {
            filterGroups: [{
              filters: [{
                propertyName: 'email',
                operator: 'EQ',
                value: contact.email
              }]
            }]
          },
          { headers }
        );
        const existingId = searchResponse.data.results[0]?.id;
        console.log(`✅ Found existing contact: ${contact.firstname} ${contact.lastname} (ID: ${existingId})`);
        return existingId;
      } catch (searchError) {
        console.error(`❌ Failed to find existing contact: ${searchError.message}`);
        return null;
      }
    } else {
      console.error(`❌ Failed to create contact: ${error.response?.data?.message || error.message}`);
      return null;
    }
  }
}

async function createDeal(deal) {
  try {
    const response = await axios.post(
      `${API_BASE}/crm/v3/objects/deals`,
      { properties: deal },
      { headers }
    );
    console.log(`✅ Created deal: ${deal.dealname} (ID: ${response.data.id})`);
    return response.data.id;
  } catch (error) {
    console.error(`❌ Failed to create deal: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function associateDealWithContact(dealId, contactId) {
  try {
    await axios.put(
      `${API_BASE}/crm/v3/objects/deals/${dealId}/associations/contacts/${contactId}/deal_to_contact`,
      {},
      { headers }
    );
    console.log(`✅ Associated deal ${dealId} with contact ${contactId}`);
  } catch (error) {
    console.error(`❌ Failed to associate: ${error.response?.data?.message || error.message}`);
  }
}

async function seedHubSpot() {
  console.log('🌱 Starting HubSpot seed process...\n');

  // Step 1: Create contacts
  console.log('📇 Creating contacts...');
  const contactIds = [];
  for (const contact of testContacts) {
    const id = await createContact(contact);
    if (id) contactIds.push(id);
    await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit protection
  }

  console.log(`\n✅ Created/found ${contactIds.length} contacts\n`);

  // Step 2: Create deals
  console.log('💼 Creating deals...');
  const dealIds = [];
  for (const deal of testDeals) {
    const id = await createDeal(deal);
    if (id) dealIds.push(id);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n✅ Created ${dealIds.length} deals\n`);

  // Step 3: Associate deals with contacts
  console.log('🔗 Associating deals with contacts...');
  for (let i = 0; i < Math.min(dealIds.length, contactIds.length); i++) {
    await associateDealWithContact(dealIds[i], contactIds[i]);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n✨ HubSpot seeding complete!');
  console.log(`\n📊 Summary:`);
  console.log(`   - Contacts: ${contactIds.length}`);
  console.log(`   - Deals: ${dealIds.length}`);
  console.log(`   - Associations: ${Math.min(dealIds.length, contactIds.length)}`);
  console.log(`\n💡 Now run "npm run dev" and click "Sync Data" in the frontend!`);
}

seedHubSpot().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});