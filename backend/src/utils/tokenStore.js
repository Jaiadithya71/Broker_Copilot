// backend/src/utils/tokenStore.js
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const GOOGLE_FILE = path.join(DATA_DIR, "google_tokens.json");
const HUBSPOT_FILE = path.join(DATA_DIR, "hubspot_tokens.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson(file) {
  try {
    if (!fs.existsSync(file)) return null;
    const raw = fs.readFileSync(file, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeJson(file, data) {
  try {
    ensureDir();
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error("❌ tokenStore write error:", e.message);
  }
}

export const tokenStore = {
  // ---------------- HUBSPOT -----------------
  setHubSpotToken(tokenData) {
    const stored = {
      ...tokenData,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
    };
    writeJson(HUBSPOT_FILE, stored);
    console.log("✅ HubSpot token stored");
  },

  getHubSpotToken() {
    const token = readJson(HUBSPOT_FILE);
    if (!token) return null;

    if (Date.now() >= token.expiresAt) {
      console.log("⚠️ HubSpot token expired");
      return null;
    }
    return token;
  },

  isHubSpotConnected() {
    return this.getHubSpotToken() !== null;
  },

  // ---------------- GOOGLE -----------------
  setGoogleToken(tokenData) {
    // Refresh tokens don’t always include refresh_token — keep the old one
    const existing = readJson(GOOGLE_FILE) || {};

    const merged = {
      ...existing,
      ...tokenData,
      expiresAt: Date.now() + (tokenData.expires_in || 3600) * 1000,
    };

    writeJson(GOOGLE_FILE, merged);
    console.log("✅ Google token stored");
  },

  getGoogleToken() {
    const token = readJson(GOOGLE_FILE);
    if (!token) return null;

    if (Date.now() >= token.expiresAt) {
      console.log("⚠️ Google access_token expired — Google API will refresh automatically if refresh_token exists");
      // DO NOT delete token — refresh_token still valid
      return token;
    }
    return token;
  },

  isGoogleConnected() {
    const t = readJson(GOOGLE_FILE);
    return !!(t && (t.access_token || t.refresh_token));
  },

  // ---------------- CLEAR ALL -----------------
  clearAll() {
    try {
      if (fs.existsSync(GOOGLE_FILE)) fs.unlinkSync(GOOGLE_FILE);
      if (fs.existsSync(HUBSPOT_FILE)) fs.unlinkSync(HUBSPOT_FILE);
    } catch {}
    console.log("🗑️ All tokens cleared");
  },
};
