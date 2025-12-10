import axios from 'axios';
import 'dotenv/config';

// Using Private App approach (simpler for demo)
const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

export class HubSpotConnector {
  
  // For private app, we don't need OAuth flow
  isConnected() {
    return !!HUBSPOT_ACCESS_TOKEN;
  }

  // Test connection
  async testConnection() {
    if (!HUBSPOT_ACCESS_TOKEN) {
      return { success: false, error: 'No access token configured' };
    }

    try {
      const response = await axios.get('https://api.hubapi.com/crm/v3/objects/contacts', {
        headers: { 'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}` },
        params: { limit: 1 }
      });
      
      return { 
        success: true, 
        message: 'HubSpot connection working!',
        contactCount: response.data.total || 0
      };
    } catch (error) {
      console.error('HubSpot connection error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  // Fetch deals (for renewal data)
  async fetchDeals() {
    if (!HUBSPOT_ACCESS_TOKEN) throw new Error('Not configured');

    try {
      const response = await axios.get('https://api.hubapi.com/crm/v3/objects/deals', {
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

  // Fetch contacts
  async fetchContacts() {
    if (!HUBSPOT_ACCESS_TOKEN) throw new Error('Not configured');

    try {
      const response = await axios.get('https://api.hubapi.com/crm/v3/objects/contacts', {
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

  // Fetch companies
  async fetchCompanies() {
    if (!HUBSPOT_ACCESS_TOKEN) throw new Error('Not configured');

    try {
      const response = await axios.get('https://api.hubapi.com/crm/v3/objects/companies', {
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