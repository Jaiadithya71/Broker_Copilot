// In-memory token storage (for demo purposes)
// In production, use encrypted database storage

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
    console.log('✅ HubSpot token stored (Memory)');
  }

  getHubSpotToken() {
    return this.tokens.hubspot;
  }

  setGoogleToken(tokenData) {
    this.tokens.google = {
      ...tokenData,
      expiresAt: Date.now() + (tokenData.expires_in * 1000)
    };
    console.log('✅ Google token stored (Memory)');
  }

  getGoogleToken() {
    return this.tokens.google;
  }

  isHubSpotConnected() {
    return this.tokens.hubspot !== null;
  }

  isGoogleConnected() {
    return this.tokens.google !== null;
  }

  clearAll() {
    this.tokens = { hubspot: null, google: null };
    console.log('🗑️ All tokens cleared');
  }
}

export const tokenStore = new TokenStore();