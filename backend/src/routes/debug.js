import express from 'express';
import { dataOrchestrator } from '../services/dataOrchestrator.js';

const router = express.Router();

/**
 * Debug endpoint for orchestration statistics
 * GET /api/debug/orchestration
 */
router.get('/orchestration', (req, res) => {
    try {
        const renewals = dataOrchestrator.getRenewals();
        const syncStatus = dataOrchestrator.getSyncStatus();

        // Calculate matching statistics
        const stats = {
            overview: {
                totalRenewals: renewals.length,
                lastSync: syncStatus.lastSync,
                hasSynced: syncStatus.hasSynced
            },
            matchingStats: {
                exactEmailMatches: 0,
                domainMatches: 0,
                keywordMatches: 0,
                renewalKeywordMatches: 0,
                attendeeMatches: 0,
                calendarKeywordMatches: 0
            },
            communicationStats: {
                dealsWithEmails: 0,
                dealsWithMeetings: 0,
                totalEmailTouchpoints: 0,
                totalMeetingTouchpoints: 0,
                avgTouchpointsPerDeal: 0
            },
            enrichmentStats: {
                dealsWithContacts: 0,
                dealsWithContactEmail: 0,
                dealsWithContactPhone: 0,
                dealsWithLastContactDate: 0,
                dealsWithSourceTracking: 0
            },
            emailToDealMapping: [],
            meetingToDealMapping: [],
            performanceMetrics: {
                lastSyncDuration: null,
                avgMatchTimePerDeal: null
            }
        };

        // Analyze each renewal
        renewals.forEach(renewal => {
            const comms = renewal.communications || {};

            // Email statistics
            if (comms.emailCount > 0) {
                stats.communicationStats.dealsWithEmails++;
                stats.communicationStats.totalEmailTouchpoints += comms.emailCount;

                // Count match types
                (comms.recentEmails || []).forEach(email => {
                    const mapping = {
                        emailId: email.id,
                        emailSubject: email.subject,
                        emailFrom: email.from,
                        emailDate: email.date,
                        matchedDealId: renewal.id,
                        matchedDealName: renewal.clientName,
                        matchScore: email._matchScore,
                        matchReason: email._matchReason
                    };
                    stats.emailToDealMapping.push(mapping);

                    // Count by match reason
                    if (email._matchReason === 'exact_email_match') stats.matchingStats.exactEmailMatches++;
                    if (email._matchReason === 'domain_match') stats.matchingStats.domainMatches++;
                    if (email._matchReason === 'keyword_match') stats.matchingStats.keywordMatches++;
                    if (email._matchReason === 'renewal_keyword') stats.matchingStats.renewalKeywordMatches++;
                });
            }

            // Meeting statistics
            if (comms.meetingCount > 0) {
                stats.communicationStats.dealsWithMeetings++;
                stats.communicationStats.totalMeetingTouchpoints += comms.meetingCount;

                // Count match types
                (comms.recentMeetings || []).forEach(meeting => {
                    const mapping = {
                        meetingId: meeting.id,
                        meetingSummary: meeting.summary,
                        meetingDate: meeting.date,
                        matchedDealId: renewal.id,
                        matchedDealName: renewal.clientName,
                        matchScore: meeting._matchScore,
                        matchReason: meeting._matchReason
                    };
                    stats.meetingToDealMapping.push(mapping);

                    // Count by match reason
                    if (meeting._matchReason === 'attendee_match') stats.matchingStats.attendeeMatches++;
                    if (meeting._matchReason === 'keyword_match') stats.matchingStats.calendarKeywordMatches++;
                });
            }

            // Enrichment statistics
            if (renewal.primaryContact) {
                stats.enrichmentStats.dealsWithContacts++;
                if (renewal.primaryContact.email) stats.enrichmentStats.dealsWithContactEmail++;
                if (renewal.primaryContact.phone) stats.enrichmentStats.dealsWithContactPhone++;
            }

            if (comms.lastContactDate) {
                stats.enrichmentStats.dealsWithLastContactDate++;
            }

            if (renewal.sources?.hubspot?.dealId) {
                stats.enrichmentStats.dealsWithSourceTracking++;
            }
        });

        // Calculate averages
        if (renewals.length > 0) {
            const totalTouchpoints = stats.communicationStats.totalEmailTouchpoints +
                stats.communicationStats.totalMeetingTouchpoints;
            stats.communicationStats.avgTouchpointsPerDeal =
                (totalTouchpoints / renewals.length).toFixed(2);
        }

        res.json(stats);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to generate orchestration stats',
            message: error.message
        });
    }
});

/**
 * Debug endpoint for detailed renewal inspection
 * GET /api/debug/renewal/:id
 */
router.get('/renewal/:id', (req, res) => {
    try {
        const renewals = dataOrchestrator.getRenewals();
        const renewal = renewals.find(r => r.id === req.params.id);

        if (!renewal) {
            return res.status(404).json({ error: 'Renewal not found' });
        }

        // Return full renewal with all enrichment data
        res.json({
            renewal,
            debug: {
                hasContact: !!renewal.primaryContact,
                hasEmail: !!renewal.primaryContact?.email,
                hasPhone: !!renewal.primaryContact?.phone,
                emailCount: renewal.communications?.emailCount || 0,
                meetingCount: renewal.communications?.meetingCount || 0,
                totalTouchpoints: renewal.communications?.totalTouchpoints || 0,
                lastContact: renewal.communications?.lastContactDate,
                sourceTracking: renewal.sources
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch renewal details',
            message: error.message
        });
    }
});

/**
 * Debug endpoint to test Google Email Fetching directly
 * GET /api/debug/google-emails
 */
router.get('/google-emails', async (req, res) => {
    try {
        console.log('🔍 Debug: Testing Google Email Fetch...');
        const { googleConnector } = await import('../connectors/google.js');

        // Check auth status first
        const auth = googleConnector.getAuthenticatedClient();
        if (!auth) {
            return res.status(401).json({ error: 'Google not authenticated' });
        }

        // Try fetching
        const emails = await googleConnector.fetchEmailsEnriched(10);

        res.json({
            success: true,
            count: emails.length,
            emails: emails.map(e => ({
                id: e.id,
                subject: e.subject,
                from: e.from,
                date: e.date,
                snippet: e.snippet
            }))
        });
    } catch (error) {
        console.error('❌ Debug: Google Fetch Error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

export default router;
