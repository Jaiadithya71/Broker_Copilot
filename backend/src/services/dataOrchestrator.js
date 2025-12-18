import { hubspotConnector } from '../connectors/hubspot.js';
import { googleConnector } from '../connectors/google.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DataOrchestrator {
  constructor() {
    this.cachedRenewals = [];
    this.lastSync = null;
    this.csvData = this.loadCSVData();
  }

  loadCSVData() {
    try {
      const csvPath = path.join(__dirname, '../../data/renewals.csv');
      if (!fs.existsSync(csvPath)) {
        console.warn('⚠️ [DataOrchestrator] renewals.csv not found for enrichment');
        return new Map();
      }
      const csvText = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const map = new Map();

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const record = {};
        headers.forEach((h, idx) => record[h] = values[idx]);
        if (record['Placement Name']) {
          map.set(record['Placement Name'], record);
        }
      }
      console.log(`✅ [DataOrchestrator] Loaded ${map.size} records from renewals.csv`);
      return map;
    } catch (err) {
      console.error('❌ [DataOrchestrator] Failed to load CSV:', err.message);
      return new Map();
    }
  }

  /**
   * Main sync - TRUE multi-source integration
   */
  async syncAllData() {
    console.log('🔄 ========== STARTING COMPREHENSIVE DATA SYNC ==========');
    const startTime = Date.now();

    try {
      // Step 1: Fetch ALL data sources
      console.log('\n📦 [Phase 1] Fetching data from all connectors...');

      const [deals, emails, calendarEvents] = await Promise.all([
        this.fetchHubSpotData(),
        this.fetchGoogleEmails(),
        this.fetchGoogleCalendar()
      ]);

      console.log(`\n✅ [Phase 1 Complete]`);
      console.log(`   - HubSpot Deals: ${deals.length}`);
      console.log(`   - Google Emails: ${emails.length}`);
      console.log(`   - Calendar Events: ${calendarEvents.length}`);

      // Step 2: Match and enrich
      console.log('\n🔗 [Phase 2] Matching and enriching data...');
      const renewals = this.matchAndEnrich(deals, emails, calendarEvents);

      console.log(`\n✅ [Phase 2 Complete] Created ${renewals.length} enriched renewal records`);

      // Step 3: Cache results
      this.cachedRenewals = renewals;
      this.lastSync = new Date().toISOString();

      const duration = Date.now() - startTime;
      console.log(`\n✨ ========== SYNC COMPLETED in ${duration}ms ==========\n`);

      return {
        success: true,
        renewalCount: renewals.length,
        emailsAnalyzed: emails.length,
        meetingsFound: calendarEvents.length,
        lastSync: this.lastSync,
        duration
      };

    } catch (error) {
      console.error('\n❌ ========== SYNC FAILED ==========');
      console.error(error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Fetch HubSpot deals with contacts
   */
  async fetchHubSpotData() {
    try {
      if (!hubspotConnector.isConnected()) {
        console.log('⚠️ HubSpot not connected, using empty data');
        return [];
      }
      return await hubspotConnector.fetchDealsWithContacts();
    } catch (error) {
      console.error('❌ HubSpot fetch error:', error.message);
      return [];
    }
  }

  /**
   * Fetch Google emails (enriched)
   */
  async fetchGoogleEmails() {
    try {
      return await googleConnector.fetchEmailsEnriched(50);
    } catch (error) {
      console.log('⚠️ Google emails not available:', error.message);
      return [];
    }
  }

  /**
   * Fetch Google calendar events
   */
  async fetchGoogleCalendar() {
    try {
      return await googleConnector.fetchCalendarEvents(90);
    } catch (error) {
      console.log('⚠️ Google calendar not available:', error.message);
      return [];
    }
  }

  /**
   * CORE MATCHING LOGIC: Match emails/meetings to deals
   */
  matchAndEnrich(deals, emails, calendarEvents) {
    return deals.map((deal, index) => {
      const dealName = deal.properties?.dealname || 'Unknown Deal';
      const amount = parseFloat(deal.properties?.amount || 0);
      const closeDate = deal.properties?.closedate || this.generateFutureDate(30 + index * 15);

      // ⭐ EXTRACT ALL SCORING PROPERTIES
      const coveragePremium = parseFloat(deal.properties?.coverage_premium || 0);
      const commissionAmount = parseFloat(deal.properties?.commission_amount || 0);
      const policyLimit = parseFloat(deal.properties?.policy_limit || 0);
      const commissionPercent = parseFloat(deal.properties?.commission_percent || 0);
      const primaryContact = deal.primaryContact;

      // === EMAIL MATCHING ===
      const matchedEmails = this.matchEmailsToDeal(deal, emails, primaryContact);

      // === CALENDAR MATCHING ===
      const matchedMeetings = this.matchCalendarToDeal(deal, calendarEvents, primaryContact);

      // Calculate communication metrics
      const emailCount = matchedEmails.length;
      const meetingCount = matchedMeetings.length;
      const totalTouchpoints = emailCount + meetingCount;

      // Get most recent communication date
      const allDates = [
        ...matchedEmails.map(e => parseInt(e.timestamp)),
        ...matchedMeetings.map(m => new Date(m.start).getTime())
      ].filter(Boolean);

      const lastContactDate = allDates.length > 0
        ? new Date(Math.max(...allDates)).toISOString().split('T')[0]
        : null;

      // Enrich from CSV if possible
      const csvRecord = this.csvData.get(deal.properties?.dealname);

      // Build enriched renewal record
      return {
        // Basic info
        id: `R-${deal.id || (1000 + index)}`,
        companyName: csvRecord?.['Client'] || deal.associatedCompany?.name || primaryContact?.company || deal.properties?.client_name || 'Unknown Company',
        dealName: deal.properties?.dealname || 'Unnamed Deal',
        clientName: csvRecord?.['Client'] || deal.associatedCompany?.name || primaryContact?.company || 'Unknown Client',
        policyNumber: `POL-${deal.id || this.generateId()}`,
        productLine: csvRecord?.['Product Line'] || deal.properties?.product_line || 'General Insurance',
        carrier: csvRecord?.['Carrier Group'] || deal.properties?.carrier_group || 'Unknown Carrier',
        specialist: csvRecord?.['Placement Specialist'] || 'Unassigned',
        premium: csvRecord ? Math.round(parseFloat(csvRecord['Total Premium'] || 0)) : Math.round(amount),
        coveragePremium: csvRecord ? Math.round(parseFloat(csvRecord['Coverage Premium Amount'] || 0)) : Math.round(coveragePremium),
        commissionAmount: csvRecord ? Math.round(parseFloat(csvRecord['Comission Amount'] || 0)) : Math.round(commissionAmount),
        policyLimit: csvRecord ? Math.round(parseFloat(csvRecord['Limit'] || 0)) : Math.round(policyLimit),
        commissionPercent: csvRecord ? parseFloat(csvRecord['Comission %'] || 0) : commissionPercent,
        expiryDate: csvRecord ? this.formatCSVDate(csvRecord['Placement Expiry Date']) : closeDate,
        status: this.mapDealStage(deal.properties?.dealstage),

        // Source tracking
        sourceSystem: 'HubSpot',
        crmRecordId: deal.id,

        // ENRICHED: Contact information
        primaryContact: primaryContact ? {
          name: `${primaryContact.firstName || ''} ${primaryContact.lastName || ''}`.trim() || 'Valued Client',
          email: primaryContact.email || null,
          phone: primaryContact.phone || null,
          hubspotId: primaryContact.id
        } : {
          name: 'Valued Client',
          email: null,
          phone: null,
          hubspotId: null
        },

        // ENRICHED: Communication history
        communications: {
          totalTouchpoints: totalTouchpoints,
          emailCount: emailCount,
          meetingCount: meetingCount,
          lastContactDate: lastContactDate,
          recentEmails: matchedEmails.slice(0, 5).map(e => ({
            id: e.id,
            subject: e.subject,
            from: e.from,
            date: new Date(parseInt(e.timestamp)).toISOString().split('T')[0]
          })),
          recentMeetings: matchedMeetings.slice(0, 3).map(m => ({
            id: m.id,
            summary: m.summary,
            date: m.start
          }))
        },

        // ENRICHED: Data source references
        sources: {
          hubspot: {
            dealId: deal.id,
            contactId: primaryContact?.id || null
          },
          google: {
            emailThreadIds: matchedEmails.map(e => e.threadId),
            calendarEventIds: matchedMeetings.map(m => m.id)
          }
        },

        // Legacy fields (for backwards compatibility)
        recentTouchpoints: totalTouchpoints,
        primaryContactName: primaryContact
          ? `${primaryContact.firstName || ''} ${primaryContact.lastName || ''}`.trim()
          : 'Valued Client',
        lastEmailId: matchedEmails[0]?.id || null
      };
    });
  }

  /**
   * Match emails to a specific deal
   */
  matchEmailsToDeal(deal, emails, primaryContact) {
    const matches = [];
    const dealName = (deal.properties?.dealname || '').toLowerCase();
    const contactEmail = primaryContact?.email?.toLowerCase();
    const companyDomain = this.extractCompanyDomain(deal.properties?.dealname || '');

    for (const email of emails) {
      let matchScore = 0;
      let matchReason = '';

      // STRATEGY 1: Exact email match (highest confidence)
      if (contactEmail && email.fromEmail === contactEmail) {
        matchScore = 100;
        matchReason = 'exact_email_match';
      }
      // STRATEGY 2: Domain match
      else if (email.domain === companyDomain) {
        matchScore = 70;
        matchReason = 'domain_match';
      }
      // STRATEGY 3: Company name in subject/snippet
      else if (dealName && (
        email.subject.toLowerCase().includes(dealName) ||
        email.snippet.toLowerCase().includes(dealName)
      )) {
        matchScore = 50;
        matchReason = 'keyword_match';
      }
      // STRATEGY 4: Renewal-related keywords
      else if (this.isRenewalRelated(email.subject) || this.isRenewalRelated(email.snippet)) {
        matchScore = 30;
        matchReason = 'renewal_keyword';
      }

      // Accept matches above threshold
      if (matchScore >= 50) {
        matches.push({
          ...email,
          _matchScore: matchScore,
          _matchReason: matchReason
        });
      }
    }

    // Sort by match score and recency
    return matches.sort((a, b) => {
      if (b._matchScore !== a._matchScore) {
        return b._matchScore - a._matchScore;
      }
      return parseInt(b.timestamp) - parseInt(a.timestamp);
    });
  }

  /**
   * Match calendar events to a specific deal
   */
  matchCalendarToDeal(deal, calendarEvents, primaryContact) {
    const matches = [];
    const dealName = (deal.properties?.dealname || '').toLowerCase();
    const contactEmail = primaryContact?.email?.toLowerCase();
    const companyName = primaryContact?.company?.toLowerCase();

    for (const event of calendarEvents) {
      let matchScore = 0;
      let matchReason = '';

      // Check if contact email is in attendees
      if (contactEmail && event.attendees.some(attendee => {
        // Handle both string and object formats
        const attendeeEmail = typeof attendee === 'string'
          ? attendee.toLowerCase()
          : (attendee?.email || attendee?.emailAddress?.address || '').toLowerCase();
        return attendeeEmail === contactEmail;
      })) {
        matchScore = 100;
        matchReason = 'attendee_match';
      }
      // Check for company name in event summary/description
      else if (companyName && (
        event.summary.toLowerCase().includes(companyName) ||
        (event.description && event.description.toLowerCase().includes(companyName))
      )) {
        matchScore = 70;
        matchReason = 'company_match';
      }
      // Check for deal name in event summary/description
      else if (dealName && (
        event.summary.toLowerCase().includes(dealName) ||
        (event.description && event.description.toLowerCase().includes(dealName))
      )) {
        matchScore = 70;
        matchReason = 'keyword_match';
      }
      // Check for renewal keywords
      else if (
        this.isRenewalRelated(event.summary) ||
        this.isRenewalRelated(event.description || '')
      ) {
        matchScore = 30;
        matchReason = 'renewal_keyword';
      }

      if (matchScore >= 40) {
        matches.push({
          ...event,
          _matchScore: matchScore,
          _matchReason: matchReason
        });
      }
    }

    return matches.sort((a, b) => b._matchScore - a._matchScore);
  }

  // ========== HELPER FUNCTIONS ==========

  isRenewalRelated(text) {
    const keywords = ['renewal', 'policy', 'insurance', 'premium', 'quote', 'expiry', 'coverage'];
    return keywords.some(kw => text.toLowerCase().includes(kw));
  }

  extractCompanyDomain(dealName) {
    const firstWord = dealName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${firstWord}.com`;
  }

  inferProductLine(dealName) {
    const name = dealName.toLowerCase();
    if (name.includes('property') || name.includes('building')) return 'Property Insurance';
    if (name.includes('liability') || name.includes('gl')) return 'General Liability';
    if (name.includes('cyber')) return 'Cyber Liability';
    if (name.includes('marine') || name.includes('cargo')) return 'Marine Cargo';
    if (name.includes('auto') || name.includes('vehicle')) return 'Auto Insurance';
    return 'General Insurance';
  }

  inferCarrier(dealName) {
    const carriers = ['HDFC ERGO', 'ICICI Lombard', 'Bajaj Allianz', 'Reliance General', 'Future Generali'];
    return carriers[Math.floor(Math.random() * carriers.length)];
  }

  formatCSVDate(csvDate) {
    if (!csvDate || csvDate === '-') return null;
    try {
      // Handle DD/MM/YY or DD/MM/YYYY
      if (csvDate.includes('/')) {
        const [d, m, y] = csvDate.split('/');
        const fullYear = y.length === 2 ? `20${y}` : y;
        return `${fullYear}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
      return csvDate; // Already ISO?
    } catch {
      return csvDate;
    }
  }

  mapDealStage(stage) {
    if (!stage) return 'Discovery';
    if (stage.includes('qualify')) return 'Pre-Renewal Review';
    if (stage.includes('present')) return 'Pricing Discussion';
    if (stage.includes('decision')) return 'Quote Comparison';
    if (stage.includes('closed')) return 'Renewed';
    return 'Discovery';
  }

  extractContactName(dealName) {
    return 'Valued Client';
  }

  generateFutureDate(daysFromNow) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  // ========== PUBLIC INTERFACE ==========

  getRenewals() {
    return this.cachedRenewals;
  }

  getSyncStatus() {
    return {
      lastSync: this.lastSync,
      recordCount: this.cachedRenewals.length,
      hasSynced: this.cachedRenewals.length > 0
    };
  }
}

export const dataOrchestrator = new DataOrchestrator();