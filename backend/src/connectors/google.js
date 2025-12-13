import { google } from "googleapis";
import { googleConfig } from "../config/oauth.js";
import { tokenStore } from "../utils/tokenStore.js";

/**
 * Google Connector for Gmail + Calendar
 * Fully supports:
 * - Email send
 * - Email fetch (metadata)
 * - Calendar fetch
 * - Auto token refresh
 */
export class GoogleConnector {
  constructor() {
    this.oauth2 = new google.auth.OAuth2(
      googleConfig.clientId,
      googleConfig.clientSecret,
      googleConfig.redirectUri
    );
  }

  /**
   * Generate OAuth URL
   */
  getAuthUrl() {
    return this.oauth2.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: googleConfig.scopes,
    });
  }

  /**
   * Exchange OAuth code for tokens
   */
  async exchangeCodeForToken(code) {
    try {
      const { tokens } = await this.oauth2.getToken(code);

      if (!tokens.refresh_token) {
        console.warn("⚠️ Google did NOT return refresh_token — user may have already granted access previously.");
      }

      this.oauth2.setCredentials(tokens);
      tokenStore.setGoogleToken(tokens);

      return { success: true, tokens };
    } catch (err) {
      console.error("❌ Google token exchange error:", err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Load stored token + refresh automatically when expired
   */
  async getAuthenticatedClient() {
    const token = tokenStore.getGoogleToken();
    if (!token) throw new Error("Google not authenticated");

    this.oauth2.setCredentials(token);

    // Attempt refresh if access_token expired
    try {
      const newToken = await this.oauth2.getAccessToken();

      if (newToken?.token && newToken?.token !== token.access_token) {
        tokenStore.setGoogleToken({
          ...token,
          access_token: newToken.token,
          expires_in: 3600,
        });
        console.log("🔄 Google access token refreshed");
      }
    } catch (err) {
      console.error("⚠️ Google token refresh failed:", err.message);
    }

    return this.oauth2;
  }

  // ===========================================================
  // ✉️ SEND EMAIL (Base64URL compliant)
  // ===========================================================
  async sendEmail(to, subject, body) {
    try {
      const auth = await this.getAuthenticatedClient();
      const gmail = google.gmail({ version: "v1", auth });

      const email = [
        `To: ${to}`,
        `Subject: ${subject}`,
        "Content-Type: text/plain; charset=\"UTF-8\"",
        "MIME-Version: 1.0",
        "",
        body,
      ].join("\n");

      const encoded = Buffer.from(email)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const response = await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw: encoded },
      });

      return { messageId: response.data.id };
    } catch (err) {
      console.error("❌ Gmail send error:", err.response?.data || err.message);
      throw new Error(err.message || "Failed to send Gmail message");
    }
  }

  // ===========================================================
  // 📧 FETCH EMAILS (FULL metadata)
  // ===========================================================
  async fetchEmailsEnriched(maxResults = 50) {
    try {
      const auth = await this.getAuthenticatedClient();
      const gmail = google.gmail({ version: "v1", auth });

      const list = await gmail.users.messages.list({
        userId: "me",
        maxResults,
        q: "after:2024/01/01",
      });

      const messages = list.data.messages || [];
      const enriched = [];

      for (const msg of messages) {
        try {
          const detail = await gmail.users.messages.get({
            userId: "me",
            id: msg.id,
            format: "metadata",
            metadataHeaders: ["From", "To", "Subject", "Date"],
          });

          const headers = detail.data.payload?.headers || [];
          const get = (n) => headers.find((h) => h.name === n)?.value || "";

          const fromEmail = (get("From").match(/[\w.-]+@[\w.-]+/) || [""])[0];
          const domain = fromEmail.split("@")[1]?.toLowerCase() || "";

          enriched.push({
            id: msg.id,
            threadId: detail.data.threadId,
            snippet: detail.data.snippet,
            date: get("Date"),
            from: get("From"),
            fromEmail,
            domain,
            to: get("To"),
            subject: get("Subject"),
            timestamp: detail.data.internalDate,
          });
        } catch (e) {
          console.warn("⚠️ Failed to fetch Gmail message:", e.message);
        }
      }

      return enriched;
    } catch (err) {
      console.error("❌ Gmail fetch error:", err.message);
      throw err;
    }
  }

  // ===========================================================
  // 📅 FETCH CALENDAR EVENTS
  // ===========================================================
  async fetchCalendarEvents(daysBack = 90) {
    try {
      const auth = await this.getAuthenticatedClient();
      const calendar = google.calendar({ version: "v3", auth });

      const timeMin = new Date();
      timeMin.setDate(timeMin.getDate() - daysBack);

      const resp = await calendar.events.list({
        calendarId: "primary",
        timeMin: timeMin.toISOString(),
        maxResults: 100,
        singleEvents: true,
        orderBy: "startTime",
      });

      return (resp.data.items || []).map((e) => ({
        id: e.id,
        summary: e.summary,
        description: e.description,
        start: e.start?.dateTime || e.start?.date,
        end: e.end?.dateTime || e.end?.date,
        attendees: e.attendees?.map((a) => a.email) || [],
        organizer: e.organizer?.email || "",
      }));
    } catch (err) {
      console.error("❌ Calendar fetch error:", err.message);
      return [];
    }
  }

  // ===========================================================
  // CONNECTION TEST
  // ===========================================================
  async testConnection() {
    try {
      await this.getAuthenticatedClient();
      return { success: true };
    } catch {
      return { success: false };
    }
  }
}

export const googleConnector = new GoogleConnector();
