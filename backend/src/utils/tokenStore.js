// In-memory token storage (for demo purposes)
// In production, use encrypted database storage

class TokenStore {
  constructor() {
    this.tokens = {
      hubspot: null,
      google: null
    };
  }

  setHubSpotToken(tokenData) {
    this.tokens.hubspot = {
      ...tokenData,
      expiresAt: Date.now() + (tokenData.expires_in * 1000)
    };
    console.log('✅ HubSpot token stored');
  }

  getHubSpotToken() {
    const token = this.tokens.hubspot;
    if (!token) return null;
    
    // Check if token is expired
    if (Date.now() >= token.expiresAt) {
      console.log('⚠️ HubSpot token expired');
      return null;
    }
    
    return token;
  }

  setGoogleToken(tokenData) {
    this.tokens.google = {
      ...tokenData,
      expiresAt: Date.now() + (tokenData.expires_in * 1000)
    };
    console.log('✅ Google token stored');
  }

  getGoogleToken() {
    const token = this.tokens.google;
    if (!token) return null;
    
    // Check if token is expired
    if (Date.now() >= token.expiresAt) {
      console.log('⚠️ Google token expired');
      return null;
    }
    
    return token;
  }

  isHubSpotConnected() {
    return this.getHubSpotToken() !== null;
  }

  isGoogleConnected() {
    return this.getGoogleToken() !== null;
  }

  clearAll() {
    this.tokens = { hubspot: null, google: null };
    console.log('🗑️ All tokens cleared');
  }
}

export const tokenStore = new TokenStore();