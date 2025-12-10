import express from 'express';
import { hubspotConnector } from '../connectors/hubspot.js';
import { googleConnector } from '../connectors/google.js';
import { tokenStore } from '../utils/tokenStore.js';

const router = express.Router();

// ============ HubSpot (Private App - No OAuth needed) ============

// Test HubSpot connection
router.get('/test/hubspot', async (req, res) => {
  const result = await hubspotConnector.testConnection();
  res.json(result);
});

// Fetch HubSpot data
router.get('/hubspot/deals', async (req, res) => {
  try {
    const deals = await hubspotConnector.fetchDeals();
    res.json({ success: true, count: deals.length, deals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/hubspot/contacts', async (req, res) => {
  try {
    const contacts = await hubspotConnector.fetchContacts();
    res.json({ success: true, count: contacts.length, contacts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ Google OAuth ============

// Step 1: Redirect to Google login
router.get('/google', (req, res) => {
  const authUrl = googleConnector.getAuthUrl();
  res.redirect(authUrl);
});

// Step 2: Handle callback
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL}?error=no_code`);
  }

  const result = await googleConnector.exchangeCodeForToken(code);
  
  if (result.success) {
    res.redirect(`${process.env.FRONTEND_URL}?google=connected`);
  } else {
    res.redirect(`${process.env.FRONTEND_URL}?error=google_failed`);
  }
});

// Test Google connection
router.get('/test/google', async (req, res) => {
  const result = await googleConnector.testConnection();
  res.json(result);
});

// ============ Status ============

// Check connection status
router.get('/status', (req, res) => {
  res.json({
    hubspot: hubspotConnector.isConnected(),
    google: tokenStore.isGoogleConnected()
  });
});

// Clear Google tokens (for testing)
router.post('/clear', (req, res) => {
  tokenStore.clearAll();
  res.json({ message: 'Google tokens cleared' });
});

export default router;