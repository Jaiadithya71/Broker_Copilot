import { google } from 'googleapis';
import { googleConfig } from '../config/oauth.js';
import { tokenStore } from '../utils/tokenStore.js';

export class GoogleConnector {
  constructor() {
    console.log('🔍 Google OAuth Config Check:');
    console.log('Client ID:', googleConfig.clientId ? `${googleConfig.clientId.substring(0, 20)}...` : 'MISSING');
    console.log('Client Secret:', googleConfig.clientSecret ? 'SET (length: ' + googleConfig.clientSecret.length + ')' : 'MISSING');
    console.log('Redirect URI:', googleConfig.redirectUri);

    this.oauth2Client = new google.auth.OAuth2(
      googleConfig.clientId,
      googleConfig.clientSecret,
      googleConfig.redirectUri
    );
  }

  // Generate OAuth URL
  getAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: googleConfig.scopes,
      prompt: 'consent'
    });
  }

  // Exchange code for token
  async exchangeCodeForToken(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      tokenStore.setGoogleToken(tokens);
      
      return { success: true, data: tokens };
    } catch (error) {
      console.error('Google token exchange error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Get authenticated client
  getAuthenticatedClient() {
    const token = tokenStore.getGoogleToken();
    if (!token) throw new Error('Not authenticated');
    
    this.oauth2Client.setCredentials(token);
    return this.oauth2Client;
  }

  // Test connection
  async testConnection() {
    try {
      const auth = this.getAuthenticatedClient();
      const gmail = google.gmail({ version: 'v1', auth });
      
      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 1
      });
      
      return { 
        success: true, 
        message: 'Google connection working!',
        sampleData: response.data 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // Fetch recent emails
  async fetchEmails(maxResults = 10) {
    try {
      const auth = this.getAuthenticatedClient();
      const gmail = google.gmail({ version: 'v1', auth });
      
      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: maxResults,
        q: 'subject:(renewal OR policy OR insurance)'
      });

      const messages = response.data.messages || [];
      const emailDetails = [];

      // Fetch details for each message
      for (const message of messages.slice(0, 5)) {
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date']
        });
        emailDetails.push(detail.data);
      }

      return emailDetails;
    } catch (error) {
      console.error('Google fetch emails error:', error.message);
      throw error;
    }
  }

  // Send email
  async sendEmail(to, subject, body) {
    try {
      const auth = this.getAuthenticatedClient();
      const gmail = google.gmail({ version: 'v1', auth });

      const email = [
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        body
      ].join('\n');

      const encodedEmail = Buffer.from(email)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedEmail
        }
      });

      return { success: true, messageId: response.data.id };
    } catch (error) {
      console.error('Google send email error:', error.message);
      throw error;
    }
  }
}

export const googleConnector = new GoogleConnector();