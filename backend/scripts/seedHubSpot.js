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

// ============= CLEANUP FUNCTIONS =============

async function getAllDeals() {
  try {
    const response = await axios.get(
      `${API_BASE}/crm/v3/objects/deals?limit=100`,
      { headers }
    );
    return response.data.results || [];
  } catch (error) {
    console.error('❌ Failed to fetch deals:', error.message);
    return [];
  }
}

async function getAllContacts() {
  try {
    const response = await axios.get(
      `${API_BASE}/crm/v3/objects/contacts?limit=100`,
      { headers }
    );
    return response.data.results || [];
  } catch (error) {
    console.error('❌ Failed to fetch contacts:', error.message);
    return [];
  }
}

async function deleteDeal(dealId) {
  try {
    await axios.delete(
      `${API_BASE}/crm/v3/objects/deals/${dealId}`,
      { headers }
    );
    console.log(`🗑️  Deleted deal: ${dealId}`);
  } catch (error) {
    console.error(`❌ Failed to delete deal ${dealId}:`, error.message);
  }
}

async function deleteContact(contactId) {
  try {
    await axios.delete(
      `${API_BASE}/crm/v3/objects/contacts/${contactId}`,
      { headers }
    );
    console.log(`🗑️  Deleted contact: ${contactId}`);
  } catch (error) {
    console.error(`❌ Failed to delete contact ${contactId}:`, error.message);
  }
}

async function cleanupHubSpot() {
  console.log('\n🧹 Cleaning up existing HubSpot data...\n');
  
  // Delete all deals
  const deals = await getAllDeals();
  console.log(`Found ${deals.length} deals to delete`);
  for (const deal of deals) {
    await deleteDeal(deal.id);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Delete all contacts
  const contacts = await getAllContacts();
  console.log(`\nFound ${contacts.length} contacts to delete`);
  for (const contact of contacts) {
    await deleteContact(contact.id);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log('\n✅ Cleanup complete!\n');
}

// ============= CREATION FUNCTIONS =============

// Enhanced test data with all required fields for scoring
const testDeals = [
  {
    dealname: 'Acme Manufacturing - Property & Casualty Insurance',
    amount: '8500000',  // Total Premium
    coverage_premium: '7650000',  // Coverage Premium Amount
    commission_amount: '1275000',  // Commission Amount (15% of total)
    policy_limit: '350000000',  // Policy Limit
    commission_percent: '15',  // Commission %
    closedate: '2026-02-15',
    dealstage: 'qualifiedtobuy',
    pipeline: 'default',
    product_line: 'Property Insurance',
    carrier: 'HDFC ERGO'
  },
  {
    dealname: 'TechCorp - Cyber Liability & Data Breach Policy',
    amount: '3200000',
    coverage_premium: '2880000',
    commission_amount: '512000',
    policy_limit: '150000000',
    commission_percent: '16',
    closedate: '2025-12-20',
    dealstage: 'presentationscheduled',
    pipeline: 'default',
    product_line: 'Cyber Insurance',
    carrier: 'Bajaj Allianz'
  },
  {
    dealname: 'GreenLogistics - Marine Cargo & Transit Coverage',
    amount: '1850000',
    coverage_premium: '1665000',
    commission_amount: '277500',
    policy_limit: '85000000',
    commission_percent: '15',
    closedate: '2026-01-05',
    dealstage: 'qualifiedtobuy',
    pipeline: 'default',
    product_line: 'Marine Insurance',
    carrier: 'ICICI Lombard'
  },
  {
    dealname: 'Sunrise Foods - General Liability & Product Insurance',
    amount: '4200000',
    coverage_premium: '3780000',
    commission_amount: '756000',
    policy_limit: '200000000',
    commission_percent: '18',
    closedate: '2025-12-30',
    dealstage: 'decisionmakerboughtin',
    pipeline: 'default',
    product_line: 'General Liability',
    carrier: 'Tata AIG'
  },
  {
    dealname: 'BlueSky Consulting - Professional Indemnity',
    amount: '2750000',
    coverage_premium: '2475000',
    commission_amount: '550000',
    policy_limit: '120000000',
    commission_percent: '20',
    closedate: '2026-03-10',
    dealstage: 'qualifiedtobuy',
    pipeline: 'default',
    product_line: 'Professional Indemnity',
    carrier: 'Reliance General'
  },
  {
    dealname: 'MegaRetail Corp - Commercial Multi-Peril Policy',
    amount: '6800000',
    coverage_premium: '6120000',
    commission_amount: '1156000',
    policy_limit: '280000000',
    commission_percent: '17',
    closedate: '2026-01-20',
    dealstage: 'qualifiedtobuy',
    pipeline: 'default',
    product_line: 'Commercial Insurance',
    carrier: 'SBI General'
  },
  {
    dealname: 'HealthPlus Hospitals - Medical Malpractice Coverage',
    amount: '9200000',
    coverage_premium: '8280000',
    commission_amount: '1472000',
    policy_limit: '385000000',
    commission_percent: '16',
    closedate: '2026-02-28',
    dealstage: 'presentationscheduled',
    pipeline: 'default',
    product_line: 'Medical Malpractice',
    carrier: 'New India Assurance'
  },
  {
    dealname: 'AutoDrive Fleet - Commercial Auto Insurance',
    amount: '5500000',
    coverage_premium: '4950000',
    commission_amount: '825000',
    policy_limit: '225000000',
    commission_percent: '15',
    closedate: '2026-01-15',
    dealstage: 'qualifiedtobuy',
    pipeline: 'default',
    product_line: 'Auto Insurance',
    carrier: 'Oriental Insurance'
  },
  {
    dealname: 'BuildRight Construction - Contractors All Risk',
    amount: '7200000',
    coverage_premium: '6480000',
    commission_amount: '1296000',
    policy_limit: '320000000',
    commission_percent: '18',
    closedate: '2025-12-25',
    dealstage: 'decisionmakerboughtin',
    pipeline: 'default',
    product_line: 'Construction Insurance',
    carrier: 'United India Insurance'
  },
  {
    dealname: 'SmartFinance Ltd - Directors & Officers Liability',
    amount: '4800000',
    coverage_premium: '4320000',
    commission_amount: '960000',
    policy_limit: '180000000',
    commission_percent: '20',
    closedate: '2026-02-10',
    dealstage: 'qualifiedtobuy',
    pipeline: 'default',
    product_line: 'D&O Insurance',
    carrier: 'ICICI Lombard'
  }
];

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
  },
  {
    firstname: 'Arjun',
    lastname: 'Gupta',
    email: 'arjun.gupta@megaretail.com',
    phone: '+91-9876543215',
    company: 'MegaRetail Corp'
  },
  {
    firstname: 'Deepika',
    lastname: 'Nair',
    email: 'deepika.nair@healthplus.com',
    phone: '+91-9876543216',
    company: 'HealthPlus Hospitals'
  },
  {
    firstname: 'Sanjay',
    lastname: 'Kumar',
    email: 'sanjay.kumar@autodrive.com',
    phone: '+91-9876543217',
    company: 'AutoDrive Fleet'
  },
  {
    firstname: 'Neha',
    lastname: 'Joshi',
    email: 'neha.joshi@buildright.com',
    phone: '+91-9876543218',
    company: 'BuildRight Construction'
  },
  {
    firstname: 'Karthik',
    lastname: 'Iyer',
    email: 'karthik.iyer@smartfinance.com',
    phone: '+91-9876543219',
    company: 'SmartFinance Ltd'
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
    console.error(`❌ Failed to create contact: ${error.response?.data?.message || error.message}`);
    return null;
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
    console.log(`   💰 Premium: ₹${parseInt(deal.amount).toLocaleString('en-IN')}`);
    console.log(`   📊 Commission: ${deal.commission_percent}% (₹${parseInt(deal.commission_amount).toLocaleString('en-IN')})`);
    console.log(`   🛡️  Limit: ₹${parseInt(deal.policy_limit).toLocaleString('en-IN')}`);
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
  console.log('🌱 Starting HubSpot seed process with enhanced data...\n');

  // Step 0: Cleanup existing data
  await cleanupHubSpot();

  // Step 1: Create contacts
  console.log('📇 Creating contacts...');
  const contactIds = [];
  for (const contact of testContacts) {
    const id = await createContact(contact);
    if (id) contactIds.push(id);
    await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit protection
  }

  console.log(`\n✅ Created ${contactIds.length} contacts\n`);

  // Step 2: Create deals
  console.log('💼 Creating deals with full scoring data...\n');
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
  console.log(`\n📋 Each deal includes:`);
  console.log(`   ✓ Total Premium (amount)`);
  console.log(`   ✓ Coverage Premium Amount`);
  console.log(`   ✓ Commission Amount`);
  console.log(`   ✓ Policy Limit`);
  console.log(`   ✓ Commission %`);
  console.log(`   ✓ Product Line`);
  console.log(`   ✓ Carrier`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Make sure these custom properties exist in HubSpot`);
  console.log(`   2. Run "npm run dev" to start your backend`);
  console.log(`   3. Click "Sync Data" in the frontend`);
  console.log(`   4. Check that priority scores are calculated correctly!`);
}

seedHubSpot().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});