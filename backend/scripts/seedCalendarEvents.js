import axios from 'axios';
import { google } from 'googleapis';
import { googleConnector } from '../src/connectors/google.js';
import { hubspotConnector } from '../src/connectors/hubspot.js';

const API_BASE = 'http://localhost:4000';

/**
 * Calendar Event Seeding Script for Phase 3 Testing
 * Creates test calendar events to validate calendar matching logic
 */

async function seedCalendarEvents() {
    console.log('='.repeat(70));
    console.log('📅 CALENDAR MATCHING TEST - EVENT SEEDING');
    console.log('='.repeat(70));
    console.log('');

    // Step 1: Check prerequisites
    console.log('🔍 Step 1: Checking prerequisites...\n');

    try {
        await axios.get(`${API_BASE}/`);
        console.log('✅ Backend server is running');
    } catch (error) {
        console.error('❌ Backend server is not running!');
        process.exit(1);
    }

    // Check Google connection
    try {
        const statusResponse = await axios.get(`${API_BASE}/auth/status`);
        if (!statusResponse.data.google) {
            console.error('❌ Google is not connected!\n');
            process.exit(1);
        }
        console.log('✅ Google is connected');
    } catch (error) {
        console.error('❌ Failed to check connection status:', error.message);
        process.exit(1);
    }

    // Step 2: Fetch HubSpot deals for contact data
    console.log('\n🔍 Step 2: Fetching HubSpot deals for contact data...\n');

    let deals = [];
    try {
        if (hubspotConnector.isConnected()) {
            deals = await hubspotConnector.fetchDealsWithContacts();
            console.log(`✅ Fetched ${deals.length} HubSpot deals`);

            const dealsWithContacts = deals.filter(d => d.primaryContact?.email);
            console.log(`   - ${dealsWithContacts.length} deals have contact emails`);
        } else {
            console.log('⚠️  HubSpot not connected, using generic test data');
        }
    } catch (error) {
        console.log('⚠️  Could not fetch HubSpot deals:', error.message);
    }

    // Step 3: Build calendar event scenarios
    console.log('\n🔍 Step 3: Building calendar event scenarios...\n');

    const events = buildCalendarScenarios(deals);

    console.log(`📊 Created ${events.length} test calendar events across 4 scenarios:`);
    console.log(`   A. Attendee Match: ${events.filter(e => e.scenario === 'A').length}`);
    console.log(`   B. Keyword Match: ${events.filter(e => e.scenario === 'B').length}`);
    console.log(`   C. Renewal Keywords: ${events.filter(e => e.scenario === 'C').length}`);
    console.log(`   D. No Match: ${events.filter(e => e.scenario === 'D').length}`);

    // Step 4: Create calendar events via Google Calendar API
    console.log('\n🔍 Step 4: Creating calendar events...\n');

    let successCount = 0;
    let failCount = 0;
    const results = [];

    try {
        const auth = googleConnector.getAuthenticatedClient();
        const calendar = google.calendar({ version: 'v3', auth });

        for (const event of events) {
            try {
                console.log(`   [${event.scenario}] Creating: ${event.summary}`);

                const response = await calendar.events.insert({
                    calendarId: 'primary',
                    requestBody: {
                        summary: event.summary,
                        description: event.description,
                        start: {
                            dateTime: event.start,
                            timeZone: 'Asia/Kolkata'
                        },
                        end: {
                            dateTime: event.end,
                            timeZone: 'Asia/Kolkata'
                        },
                        attendees: event.attendees.map(email => ({ email }))
                    }
                });

                console.log(`       ✅ Created! Expected match: ${event.expectedMatch || 'None'}`);
                console.log(`       📊 Expected score: ${event.expectedScore}`);
                successCount++;

                results.push({
                    scenario: event.scenario,
                    summary: event.summary,
                    expectedMatch: event.expectedMatch,
                    expectedScore: event.expectedScore,
                    eventId: response.data.id
                });

                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
                console.log(`       ❌ Error: ${error.message}`);
                failCount++;
            }
        }
    } catch (error) {
        console.error('❌ Failed to create calendar events:', error.message);
        process.exit(1);
    }

    // Step 5: Summary
    console.log('\n' + '='.repeat(70));
    console.log('✨ CALENDAR EVENT SEEDING COMPLETE');
    console.log('='.repeat(70));
    console.log(`\n📊 Results:`);
    console.log(`   ✅ Successfully created: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📅 Total attempted: ${events.length}`);

    if (results.length > 0) {
        console.log('\n📅 Expected Matching Results:');
        console.log('   (After running sync, verify these matches)\n');

        const grouped = groupBy(results, 'scenario');
        Object.keys(grouped).sort().forEach(scenario => {
            const scenarioName = getScenarioName(scenario);
            console.log(`   ${scenario}. ${scenarioName}:`);
            grouped[scenario].forEach(r => {
                console.log(`      - "${r.summary}"`);
                console.log(`        Expected: ${r.expectedMatch || 'No match'} (score: ${r.expectedScore})`);
            });
            console.log('');
        });
    }

    console.log('💡 Next Steps:');
    console.log('   1. Run: node scripts/testOrchestration.js');
    console.log('   2. Or manually click "Sync Data" in frontend');
    console.log('   3. Verify meeting matches in Communication Timeline\n');
}

/**
 * Build calendar event scenarios
 */
function buildCalendarScenarios(deals) {
    const events = [];
    const now = new Date();

    // Helper to create date X days ago
    const daysAgo = (days) => {
        const date = new Date(now);
        date.setDate(date.getDate() - days);
        return date;
    };

    // Helper to create event times
    const createEventTimes = (daysAgo, startHour = 10, durationHours = 1) => {
        const start = new Date(daysAgo);
        start.setHours(startHour, 0, 0, 0);

        const end = new Date(start);
        end.setHours(start.getHours() + durationHours);

        return {
            start: start.toISOString(),
            end: end.toISOString()
        };
    };

    const dealsWithEmails = deals.filter(d => d.primaryContact?.email);

    // SCENARIO A: Attendee Match (score 100)
    if (dealsWithEmails.length > 0) {
        dealsWithEmails.slice(0, 2).forEach((deal, i) => {
            const times = createEventTimes(daysAgo(15 + i * 10));
            events.push({
                scenario: 'A',
                summary: `${deal.properties.dealname} - Policy Renewal Review`,
                description: `Quarterly review meeting to discuss policy renewal and coverage updates for ${deal.properties.dealname}.`,
                attendees: [deal.primaryContact.email],
                start: times.start,
                end: times.end,
                expectedMatch: deal.properties.dealname,
                expectedScore: 100,
                expectedReason: 'attendee_match'
            });
        });
    } else {
        const times = createEventTimes(daysAgo(20));
        events.push({
            scenario: 'A',
            summary: 'Insurance Policy Review Meeting',
            description: 'Review meeting for policy renewal',
            attendees: ['contact@example.com'],
            start: times.start,
            end: times.end,
            expectedMatch: 'Any deal with matching contact',
            expectedScore: 100,
            expectedReason: 'attendee_match'
        });
    }

    // SCENARIO B: Keyword Match (score 70)
    if (deals.length > 0) {
        deals.slice(0, 2).forEach((deal, i) => {
            const times = createEventTimes(daysAgo(25 + i * 15));
            events.push({
                scenario: 'B',
                summary: `${deal.properties.dealname} Coverage Discussion`,
                description: `Internal meeting to prepare for ${deal.properties.dealname} renewal presentation.`,
                attendees: ['team@insurance-broker.com'],
                start: times.start,
                end: times.end,
                expectedMatch: deal.properties.dealname,
                expectedScore: 70,
                expectedReason: 'keyword_match'
            });
        });
    }

    // SCENARIO C: Renewal Keywords (score 40)
    const times1 = createEventTimes(daysAgo(30));
    const times2 = createEventTimes(daysAgo(45));

    events.push(
        {
            scenario: 'C',
            summary: 'Insurance Renewal Strategy Call',
            description: 'Quarterly planning call to discuss upcoming policy renewals and premium negotiations.',
            attendees: ['strategy@insurance.com'],
            start: times1.start,
            end: times1.end,
            expectedMatch: 'Any deal (low confidence)',
            expectedScore: 40,
            expectedReason: 'renewal_keyword'
        },
        {
            scenario: 'C',
            summary: 'Policy Coverage Review Session',
            description: 'Review session for policy coverage and premium adjustments.',
            attendees: ['review@broker.com'],
            start: times2.start,
            end: times2.end,
            expectedMatch: 'Any deal (low confidence)',
            expectedScore: 40,
            expectedReason: 'renewal_keyword'
        }
    );

    // SCENARIO D: No Match
    const times3 = createEventTimes(daysAgo(10));
    const times4 = createEventTimes(daysAgo(5));

    events.push(
        {
            scenario: 'D',
            summary: 'Team Standup Meeting',
            description: 'Daily team standup to discuss project progress.',
            attendees: ['team@company.com'],
            start: times3.start,
            end: times3.end,
            expectedMatch: 'None',
            expectedScore: 0,
            expectedReason: 'no_match'
        },
        {
            scenario: 'D',
            summary: 'Coffee Chat with Client',
            description: 'Informal coffee meeting to catch up.',
            attendees: ['client@business.com'],
            start: times4.start,
            end: times4.end,
            expectedMatch: 'None',
            expectedScore: 0,
            expectedReason: 'no_match'
        }
    );

    return events;
}

// Helper functions
function groupBy(array, key) {
    return array.reduce((result, item) => {
        (result[item[key]] = result[item[key]] || []).push(item);
        return result;
    }, {});
}

function getScenarioName(scenario) {
    const names = {
        'A': 'Attendee Match',
        'B': 'Keyword Match',
        'C': 'Renewal Keywords',
        'D': 'No Match'
    };
    return names[scenario] || scenario;
}

// Run the script
seedCalendarEvents().catch(err => {
    console.error('\n💥 Fatal error:', err.message);
    process.exit(1);
});
