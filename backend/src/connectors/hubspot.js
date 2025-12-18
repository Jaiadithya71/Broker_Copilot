import axios from 'axios';
import 'dotenv/config';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const API_BASE = 'https://api.hubapi.com';

export class HubSpotConnector {

  constructor() {
    this._connected = false;
  }

  isConnected() {
    return this._connected;
  }

  async testConnection() {
    console.log('🔗 [HubSpot Connector] Testing connection...');

    if (!HUBSPOT_ACCESS_TOKEN) {
      console.error('❌ [HubSpot Connector] No access token configured');
      return { success: false, error: 'No access token configured' };
    }

    try {
      const response = await axios.get(`${API_BASE}/crm/v3/objects/contacts`, {
        headers: { 'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}` },
        params: { limit: 1 }
      });

      const contactCount = response.data.total || 0;
      console.log('✅ [HubSpot Connector] Connection successful!', {
        timestamp: new Date().toISOString(),
        contactCount
      });

      this._connected = true; // Mark as connected on success

      return {
        success: true,
        message: 'HubSpot connection working!',
        contactCount
      };
    } catch (error) {
      console.error('❌ [HubSpot Connector] Connection failed:', error.message);
      this._connected = false;
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Fetch deals WITH associated contacts (enriched)
   */
  async fetchDealsWithContacts() {
    if (!HUBSPOT_ACCESS_TOKEN) throw new Error('Not configured');
    if (!this._connected) {
      console.warn('⚠️ [HubSpot] Skipping fetch - Connector not connected (User connect required)');
      return [];
    }

    try {
      console.log('📦 [HubSpot] Fetching deals with contact associations...');

      // Step 1: Fetch deals with associations
      const dealsResponse = await axios.get(`${API_BASE}/crm/v3/objects/deals`, {
        headers: { 'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}` },
        params: {
          limit: 100,
          properties: [
            'dealname',
            'amount',
            'closedate',
            'dealstage',
            'pipeline',
            'hs_object_id',
            'coverage_premium',
            'commission_amount',
            'policy_limit',
            'commission_percent',
            'product_line',      // Real field
            'carrier_group',      // Real field
            'client_name'         // Backup field
          ].join(','),
          associations: 'contacts,companies' // Request company associations too
        }
      });

      const deals = dealsResponse.data.results || [];
      console.log(`✅ [HubSpot] Fetched ${deals.length} deals`);

      // Step 2: For each deal, fetch associated contact/company details
      const enrichedDeals = await Promise.all(
        deals.map(async (deal) => {
          const contactIds = deal.associations?.contacts?.results?.map(c => c.id) || [];
          const companyIds = deal.associations?.companies?.results?.map(c => c.id) || [];

          let primaryContact = null;
          let associatedCompany = null;

          // Fetch contact if exists
          if (contactIds.length > 0) {
            try {
              const contactResponse = await axios.get(
                `${API_BASE}/crm/v3/objects/contacts/${contactIds[0]}`,
                {
                  headers: { 'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}` },
                  params: { properties: 'firstname,lastname,email,phone,company' }
                }
              );
              const props = contactResponse.data.properties;
              primaryContact = {
                id: contactIds[0],
                firstName: props.firstname,
                lastName: props.lastname,
                email: props.email,
                phone: props.phone,
                company: props.company
              };
            } catch (err) {
              console.warn(`⚠️ Failed to fetch contact ${contactIds[0]}:`, err.message);
            }
          }

          // Fetch company if exists
          if (companyIds.length > 0) {
            try {
              const companyResponse = await axios.get(
                `${API_BASE}/crm/v3/objects/companies/${companyIds[0]}`,
                {
                  headers: { 'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}` },
                  params: { properties: 'name,domain' }
                }
              );
              associatedCompany = {
                id: companyIds[0],
                name: companyResponse.data.properties.name
              };
            } catch (err) {
              console.warn(`⚠️ Failed to fetch company ${companyIds[0]}:`, err.message);
            }
          }

          return {
            ...deal,
            primaryContact,
            associatedCompany
          };
        })
      );

      console.log(`✅ [HubSpot] Enriched ${enrichedDeals.filter(d => d.primaryContact).length}/${enrichedDeals.length} deals with contact info`);

      return enrichedDeals;

    } catch (error) {
      console.error('❌ [HubSpot] Fetch deals error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Legacy method (kept for backwards compatibility)
   */
  async fetchDeals() {
    if (!HUBSPOT_ACCESS_TOKEN) throw new Error('Not configured');

    try {
      const response = await axios.get(`${API_BASE}/crm/v3/objects/deals`, {
        headers: { 'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}` },
        params: {
          limit: 100,
          properties: 'dealname,amount,closedate,dealstage,pipeline,hs_object_id'
        }
      });

      return response.data.results || [];
    } catch (error) {
      console.error('HubSpot fetch deals error:', error.response?.data || error.message);
      throw error;
    }
  }

  async fetchContacts() {
    if (!HUBSPOT_ACCESS_TOKEN) throw new Error('Not configured');

    try {
      const response = await axios.get(`${API_BASE}/crm/v3/objects/contacts`, {
        headers: { 'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}` },
        params: {
          limit: 100,
          properties: 'firstname,lastname,email,phone,company,hs_object_id'
        }
      });

      return response.data.results || [];
    } catch (error) {
      console.error('HubSpot fetch contacts error:', error.response?.data || error.message);
      throw error;
    }
  }

  async fetchCompanies() {
    if (!HUBSPOT_ACCESS_TOKEN) throw new Error('Not configured');

    try {
      const response = await axios.get(`${API_BASE}/crm/v3/objects/companies`, {
        headers: { 'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}` },
        params: {
          limit: 100,
          properties: 'name,domain,industry,city,hs_object_id'
        }
      });

      return response.data.results || [];
    } catch (error) {
      console.error('HubSpot fetch companies error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export const hubspotConnector = new HubSpotConnector();