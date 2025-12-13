import axios from 'axios';
import { hubspotConnector } from '../src/connectors/hubspot.js';

const API_BASE = 'http://localhost:4000';

/**
 * Enhanced Email Seeding Script for Phase 2 Testing
 * Creates 5 test scenarios to validate email matching logic
 */

async function seedEmailScenarios() {
    console.log('='.repeat(70));
    console.log('📧 EMAIL MATCHING TEST - SCENARIO SEEDING');
    console.log('='.repeat(70));
    console.log('');

    // Step 1: Check server and connections
    console.log('🔍 Step 1: Checking prerequisites...\n');

    try {
        await axios.get(`${API_BASE}/`);
        console.log('✅ Backend server is running');
    } catch (error) {
        console.error('❌ Backend server is not running!');
        console.log('\n💡 Start the backend first: npm run dev\n');
        process.exit(1);
    }

    // Check Google connection
    try {
        const statusResponse = await axios.get(`${API_BASE}/auth/status`);
        if (!statusResponse.data.google) {
            console.error('❌ Google is not connected!\n');
            console.log('💡 Connect Google first via frontend\n');
            process.exit(1);
        }
        console.log('✅ Google is connected');
    } catch (error) {
        console.error('❌ Failed to check connection status:', error.message);
        process.exit(1);
    }

    // Step 2: Fetch HubSpot deals to get real contact data
    console.log('\n🔍 Step 2: Fetching HubSpot deals for contact data...\n');

    let deals = [];
    try {
        if (hubspotConnector.isConnected()) {
            deals = await hubspotConnector.fetchDealsWithContacts();
            console.log(`✅ Fetched ${deals.length} HubSpot deals`);

            const dealsWithContacts = deals.filter(d => d.primaryContact?.email);
            console.log(`   - ${dealsWithContacts.length} deals have contact emails`);

            if (dealsWithContacts.length > 0) {
                console.log('\n📋 Sample contacts:');
                dealsWithContacts.slice(0, 3).forEach(deal => {
                    console.log(`   - ${deal.properties.dealname}: ${deal.primaryContact.email}`);
                });
            }
        } else {
            console.log('⚠️  HubSpot not connected, using generic test data');
        }
    } catch (error) {
        console.log('⚠️  Could not fetch HubSpot deals:', error.message);
        console.log('   Continuing with generic test data...');
    }

    // Step 3: Build test email scenarios
    console.log('\n🔍 Step 3: Building test email scenarios...\n');

    const scenarios = buildEmailScenarios(deals);

    console.log(`📊 Created ${scenarios.length} test emails across 5 scenarios:`);
    console.log(`   A. Exact Email Match: ${scenarios.filter(s => s.scenario === 'A').length}`);
    console.log(`   B. Domain Match: ${scenarios.filter(s => s.scenario === 'B').length}`);
    console.log(`   C. Keyword Match: ${scenarios.filter(s => s.scenario === 'C').length}`);
    console.log(`   D. Renewal Keywords: ${scenarios.filter(s => s.scenario === 'D').length}`);
    console.log(`   E. No Match: ${scenarios.filter(s => s.scenario === 'E').length}`);

    // Step 4: Send test emails
    console.log('\n🔍 Step 4: Sending test emails...\n');

    let successCount = 0;
    let failCount = 0;
    const results = [];

    for (const email of scenarios) {
        try {
            console.log(`   [${email.scenario}] Sending: ${email.subject}`);

            const response = await axios.post(`${API_BASE}/api/send-email`, {
                to: email.to,
                subject: email.subject,
                body: email.body
            });

            if (response.data.success) {
                console.log(`       ✅ Sent! Expected match: ${email.expectedMatch || 'None'}`);
                console.log(`       📊 Expected score: ${email.expectedScore}`);
                successCount++;
                results.push({
                    scenario: email.scenario,
                    subject: email.subject,
                    expectedMatch: email.expectedMatch,
                    expectedScore: email.expectedScore,
                    messageId: response.data.messageId
                });
            } else {
                console.log(`       ❌ Failed: ${response.data.error}`);
                failCount++;
            }

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
            console.log(`       ❌ Error: ${error.response?.data?.error || error.message}`);
            failCount++;
        }
    }

    // Step 5: Summary and next steps
    console.log('\n' + '='.repeat(70));
    console.log('✨ EMAIL SEEDING COMPLETE');
    console.log('='.repeat(70));
    console.log(`\n📊 Results:`);
    console.log(`   ✅ Successfully sent: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📬 Total attempted: ${scenarios.length}`);

    if (results.length > 0) {
        console.log('\n📧 Expected Matching Results:');
        console.log('   (After running sync, verify these matches)\n');

        const grouped = groupBy(results, 'scenario');
        Object.keys(grouped).sort().forEach(scenario => {
            const scenarioName = getScenarioName(scenario);
            console.log(`   ${scenario}. ${scenarioName}:`);
            grouped[scenario].forEach(r => {
                console.log(`      - "${r.subject}"`);
                console.log(`        Expected: ${r.expectedMatch || 'No match'} (score: ${r.expectedScore})`);
            });
            console.log('');
        });
    }

    console.log('💡 Next Steps:');
    console.log('   1. Wait 30 seconds for emails to arrive in Gmail');
    console.log('   2. Run: node scripts/testOrchestration.js');
    console.log('   3. Or manually click "Sync Data" in frontend');
    console.log('   4. Verify matching results match expectations above\n');
}

/**
 * Build comprehensive test email scenarios
 */
function buildEmailScenarios(deals) {
    const scenarios = [];
    const recipientEmail = 'james134255@gmail.com'; // Your Gmail address

    // Get deals with contact emails for Scenario A
    const dealsWithEmails = deals.filter(d => d.primaryContact?.email);

    // SCENARIO A: Exact Email Match (Highest confidence - score 100)
    if (dealsWithEmails.length > 0) {
        dealsWithEmails.slice(0, 2).forEach(deal => {
            scenarios.push({
                scenario: 'A',
                to: recipientEmail,
                subject: `Re: ${deal.properties.dealname} - Policy Renewal Discussion`,
                body: `Hi,\n\nI wanted to follow up on our recent conversation about the insurance renewal for ${deal.properties.dealname}.\n\nCould we schedule a call this week to discuss the premium and coverage details?\n\nBest regards,\n${deal.primaryContact.firstName || 'Contact'}`,
                from: deal.primaryContact.email,
                expectedMatch: deal.properties.dealname,
                expectedScore: 100,
                expectedReason: 'exact_email_match'
            });
        });
    } else {
        // Fallback if no HubSpot contacts
        scenarios.push({
            scenario: 'A',
            to: recipientEmail,
            subject: 'Acme Corp - Insurance Renewal Discussion',
            body: 'Following up on the policy renewal...',
            from: 'contact@acmecorp.com',
            expectedMatch: 'Acme Corp (if exists in HubSpot)',
            expectedScore: 100,
            expectedReason: 'exact_email_match'
        });
    }

    // SCENARIO B: Domain Match (score 70)
    if (dealsWithEmails.length > 0) {
        const deal = dealsWithEmails[0];
        const domain = deal.primaryContact.email.split('@')[1];

        scenarios.push({
            scenario: 'B',
            to: recipientEmail,
            subject: 'Quick question about coverage',
            body: `Hello,\n\nI'm from the same company and had a question about our insurance policy.\n\nThanks!`,
            from: `colleague@${domain}`,
            expectedMatch: deal.properties.dealname,
            expectedScore: 70,
            expectedReason: 'domain_match'
        });
    }

    // SCENARIO C: Keyword Match (score 50)
    if (deals.length > 0) {
        deals.slice(0, 2).forEach(deal => {
            scenarios.push({
                scenario: 'C',
                to: recipientEmail,
                subject: `Question about ${deal.properties.dealname} insurance policy`,
                body: `Hi,\n\nI have some questions regarding the ${deal.properties.dealname} insurance coverage.\n\nCould you provide more details?\n\nThanks`,
                from: 'someone@differentdomain.com',
                expectedMatch: deal.properties.dealname,
                expectedScore: 50,
                expectedReason: 'keyword_match'
            });
        });
    } else {
        scenarios.push({
            scenario: 'C',
            to: recipientEmail,
            subject: 'Question about Acme Corp insurance policy',
            body: 'Inquiry about Acme Corp coverage...',
            from: 'inquiry@example.com',
            expectedMatch: 'Acme Corp (if exists)',
            expectedScore: 50,
            expectedReason: 'keyword_match'
        });
    }

    // SCENARIO D: Renewal Keywords Only (score 30)
    scenarios.push(
        {
            scenario: 'D',
            to: recipientEmail,
            subject: 'Insurance Policy Renewal Reminder',
            body: `Dear valued customer,\n\nThis is a reminder that your insurance policy is up for renewal soon.\n\nPlease review your coverage and premium details.\n\nBest regards,\nInsurance Team`,
            from: 'renewals@insurance-provider.com',
            expectedMatch: 'Any deal (low confidence)',
            expectedScore: 30,
            expectedReason: 'renewal_keyword'
        },
        {
            scenario: 'D',
            to: recipientEmail,
            subject: 'Coverage Review - Annual Premium Update',
            body: 'Time to review your annual premium and coverage limits...',
            from: 'support@insuranceco.com',
            expectedMatch: 'Any deal (low confidence)',
            expectedScore: 30,
            expectedReason: 'renewal_keyword'
        }
    );

    // SCENARIO E: No Match (should not match any deal)
    scenarios.push(
        {
            scenario: 'E',
            to: recipientEmail,
            subject: 'Weekend Plans and Coffee Meetup',
            body: `Hey!\n\nWant to grab coffee this weekend? Let me know your availability.\n\nCheers!`,
            from: 'friend@personal-email.com',
            expectedMatch: 'None',
            expectedScore: 0,
            expectedReason: 'no_match'
        },
        {
            scenario: 'E',
            to: recipientEmail,
            subject: 'Project Update - Q4 Marketing Campaign',
            body: 'Here is the latest update on our marketing campaign progress...',
            from: 'marketing@company.com',
            expectedMatch: 'None',
            expectedScore: 0,
            expectedReason: 'no_match'
        }
    );

    return scenarios;
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
        'A': 'Exact Email Match',
        'B': 'Domain Match',
        'C': 'Keyword Match',
        'D': 'Renewal Keywords',
        'E': 'No Match'
    };
    return names[scenario] || scenario;
}

// Run the script
seedEmailScenarios().catch(err => {
    console.error('\n💥 Fatal error:', err.message);
    process.exit(1);
});
