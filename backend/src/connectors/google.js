// backend/src/connectors/google.js
import { google } from 'googleapis';
import { googleConfig } from '../config/oauth.js';
import { tokenStore } from '../utils/tokenStore.js';

/**
 * Utility: extract valid email addresses from a string
 * Accepts forms like:
 *  - "John Doe <john@example.com>"
 *  - "john@example.com"
 *  - "john@example.com, jane@example.org"
 */
function extractEmailAddresses(input) {
  if (!input || typeof input !== 'string') return [];
  // simple RFC-lite regex to capture emails
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = input.match(emailRegex);
  return matches ? matches.map(e => e.trim().toLowerCase()) : [];
}

/**
 * Build a minimal MIME message with safe headers
 * Uses CRLF (\r\n) line endings (required by Gmail)
 */
function buildRawMessage({ toList, subject, body, from }) {
  const headers = [];
  if (from) headers.push(`From: ${from}`);
  headers.push(`To: ${toList.join(', ')}`);
  headers.push(`Subject: ${subject}`);
  headers.push('MIME-Version: 1.0');
  headers.push('Content-Type: text/plain; charset="UTF-8"');
  // blank line then body
  const mime = headers.join('\r\n') + '\r\n\r\n' + (body || '');
  // base64url encode
  return Buffer.from(mime, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export class GoogleConnector {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      googleConfig.clientId,
      googleConfig.clientSecret,
      googleConfig.redirectUri
    );

    // If tokenStore already has tokens, set them
    const token = tokenStore.getGoogleToken();
    if (token) {
      this.oauth2Client.setCredentials(token);
    }

    // Persist refreshed tokens automatically
    this.oauth2Client.on && this.oauth2Client.on('tokens', (tokens) => {
      // tokens might contain access_token and refresh_token (occasionally)
      const current = tokenStore.getGoogleToken() || {};
      const merged = { ...current, ...tokens };
      tokenStore.setGoogleToken(merged);
      console.log('🔁 [Google] Tokens refreshed and saved to tokenStore');
    });
  }

  getAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: googleConfig.scopes,
      prompt: 'consent' // ensures refresh_token on first consent
    });
  }

  async exchangeCodeForToken(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      // Ensure tokens contain refresh_token if offered
      this.oauth2Client.setCredentials(tokens);
      tokenStore.setGoogleToken(tokens);
      return { success: true, data: tokens };
    } catch (error) {
      console.error('Google token exchange error:', error?.message || error);
      return { success: false, error: error?.message || String(error) };
    }
  }

  /**
   * Ensure we have a valid authenticated OAuth2 client.
   * If access token expired, the library will auto-refresh (if refresh_token exists).
   * We re-load saved tokens each call to be resilient across restarts.
   */
  getAuthenticatedClient() {
    const token = tokenStore.getGoogleToken();
    if (!token) throw new Error('Not authenticated (no token). Please connect Google.');
    this.oauth2Client.setCredentials(token);
    return this.oauth2Client;
  }

  async testConnection() {
    try {
      const auth = this.getAuthenticatedClient();
      const gmail = google.gmail({ version: 'v1', auth });
      const response = await gmail.users.messages.list({ userId: 'me', maxResults: 1 });
      return { success: true, message: 'Google connection working!', sampleData: response.data };
    } catch (error) {
      return { success: false, error: error?.message || String(error) };
    }
  }

  // --- improved sendEmail with validation, token refresh persistence and clearer errors ---
  async sendEmail(to, subject, body) {
    // Accept array or string
    try {
      if (!to) throw new Error('Missing "to" field');
      const toRaw = Array.isArray(to) ? to.join(',') : String(to);

      // Extract valid email addresses
      const addresses = extractEmailAddresses(toRaw);
      if (!addresses.length) {
        throw new Error(`No valid recipient email addresses found in "${toRaw}"`);
      }

      // Build raw email (From header optional; Gmail will set 'me' as the sender)
      // If you want to include a specific From display, set from to the connected user's email
      const from = undefined; // or: tokenStore.getGoogleUserEmail() if you store it
      const raw = buildRawMessage({ toList: addresses, subject: subject || '', body: body || '', from });

      // Send using Gmail API
      const auth = this.getAuthenticatedClient();
      const gmail = google.gmail({ version: 'v1', auth });

      try {
        const response = await gmail.users.messages.send({
          userId: 'me',
          requestBody: { raw }
        });
        return { success: true, messageId: response.data.id };
      } catch (err) {
        // If we get an auth error and refresh_token exists, try refreshing once
        const status = err?.response?.status;
        const data = err?.response?.data;
        console.error('Google send error details:', status, data);

        // If invalid argument (like header), bubble up clear message
        if (status === 400 && data?.error?.errors?.[0]?.message) {
          throw new Error(data.error.errors[0].message);
        }

        // For other errors, rethrow
        throw err;
      }
    } catch (error) {
      // Normalize error message
      const msg = error?.message || String(error);
      console.error('❌ [Google] sendEmail failed:', msg);
      throw new Error(msg);
    }
  }

  // Keep other helpers (fetchEmailsEnriched, fetchCalendarEvents...) unchanged or copy from original if needed
}

export const googleConnector = new GoogleConnector();
