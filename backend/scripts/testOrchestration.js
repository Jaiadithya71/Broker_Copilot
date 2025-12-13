import axios from 'axios';

const API_BASE = 'http://localhost:4000';

/**
 * Orchestration Test Validation Script
 * Validates email and calendar matching results after sync
 */

async function testOrchestration() {
    console.log('='.repeat(70));
    console.log('🧪 ORCHESTRATION LAYER VALIDATION TEST');
    console.log('='.repeat(70));
    console.log('');

    const testResults = {
        passed: 0,
        failed: 0,
        warnings: 0,
        details: []
    };

    // Step 1: Trigger sync
    console.log('🔍 Step 1: Triggering data sync...\n');

    let syncResult;
    try {
        const response = await axios.post(`${API_BASE}/api/sync`);
        syncResult = response.data;

        if (syncResult.success) {
            console.log('✅ Sync completed successfully');
            console.log(`   - Duration: ${syncResult.duration}ms`);
            console.log(`   - Renewals: ${syncResult.renewalCount}`);
            console.log(`   - Emails analyzed: ${syncResult.emailsAnalyzed}`);
            console.log(`   - Meetings found: ${syncResult.meetingsFound}`);
            testResults.passed++;
        } else {
            console.log('❌ Sync failed:', syncResult.error);
            testResults.failed++;
            testResults.details.push({
                test: 'Data Sync',
                status: 'FAILED',
                error: syncResult.error
            });
        }
    } catch (error) {
        console.log('❌ Sync request failed:', error.message);
        testResults.failed++;
        process.exit(1);
    }

    // Step 2: Fetch renewal data
    console.log('\n🔍 Step 2: Fetching renewal data...\n');

    let renewals = [];
    try {
        const response = await axios.get(`${API_BASE}/api/renewals`);
        renewals = response.data.items || [];

        console.log(`✅ Fetched ${renewals.length} renewal records`);
        console.log(`   - Source: ${response.data.source}`);
        console.log(`   - Synced: ${response.data.synced}`);
        testResults.passed++;
    } catch (error) {
        console.log('❌ Failed to fetch renewals:', error.message);
        testResults.failed++;
        process.exit(1);
    }

    // Step 3: Validate email matching
    console.log('\n🔍 Step 3: Validating email matching...\n');

    const emailStats = {
        totalEmails: syncResult.emailsAnalyzed || 0,
        dealsWithEmails: 0,
        exactMatches: 0,
        domainMatches: 0,
        keywordMatches: 0,
        totalTouchpoints: 0
    };

    renewals.forEach(renewal => {
        const comms = renewal.communications || {};

        if (comms.emailCount > 0) {
            emailStats.dealsWithEmails++;
            emailStats.totalTouchpoints += comms.emailCount;

            // Check recent emails for match reasons
            (comms.recentEmails || []).forEach(email => {
                if (email._matchReason === 'exact_email_match') emailStats.exactMatches++;
                if (email._matchReason === 'domain_match') emailStats.domainMatches++;
                if (email._matchReason === 'keyword_match') emailStats.keywordMatches++;
            });
        }
    });

    console.log('📊 Email Matching Statistics:');
    console.log(`   - Total emails fetched: ${emailStats.totalEmails}`);
    console.log(`   - Deals with matched emails: ${emailStats.dealsWithEmails}`);
    console.log(`   - Exact email matches: ${emailStats.exactMatches}`);
    console.log(`   - Domain matches: ${emailStats.domainMatches}`);
    console.log(`   - Keyword matches: ${emailStats.keywordMatches}`);
    console.log(`   - Total touchpoints: ${emailStats.totalTouchpoints}`);

    // Validate email matching quality
    if (emailStats.totalEmails > 0) {
        const matchRate = (emailStats.totalTouchpoints / emailStats.totalEmails) * 100;
        console.log(`\n   📈 Match rate: ${matchRate.toFixed(1)}%`);

        if (matchRate >= 80) {
            console.log('   ✅ PASS: Match rate ≥ 80%');
            testResults.passed++;
        } else if (matchRate >= 50) {
            console.log('   ⚠️  WARNING: Match rate below 80%');
            testResults.warnings++;
        } else {
            console.log('   ❌ FAIL: Match rate below 50%');
            testResults.failed++;
        }
    } else {
        console.log('   ⚠️  No emails to validate');
        testResults.warnings++;
    }

    // Step 4: Validate calendar matching
    console.log('\n🔍 Step 4: Validating calendar matching...\n');

    const calendarStats = {
        totalMeetings: syncResult.meetingsFound || 0,
        dealsWithMeetings: 0,
        attendeeMatches: 0,
        keywordMatches: 0,
        totalMeetingTouchpoints: 0
    };

    renewals.forEach(renewal => {
        const comms = renewal.communications || {};

        if (comms.meetingCount > 0) {
            calendarStats.dealsWithMeetings++;
            calendarStats.totalMeetingTouchpoints += comms.meetingCount;

            // Check recent meetings for match reasons
            (comms.recentMeetings || []).forEach(meeting => {
                if (meeting._matchReason === 'attendee_match') calendarStats.attendeeMatches++;
                if (meeting._matchReason === 'keyword_match') calendarStats.keywordMatches++;
            });
        }
    });

    console.log('📊 Calendar Matching Statistics:');
    console.log(`   - Total meetings fetched: ${calendarStats.totalMeetings}`);
    console.log(`   - Deals with matched meetings: ${calendarStats.dealsWithMeetings}`);
    console.log(`   - Attendee matches: ${calendarStats.attendeeMatches}`);
    console.log(`   - Keyword matches: ${calendarStats.keywordMatches}`);
    console.log(`   - Total meeting touchpoints: ${calendarStats.totalMeetingTouchpoints}`);

    if (calendarStats.totalMeetings > 0) {
        const matchRate = (calendarStats.totalMeetingTouchpoints / calendarStats.totalMeetings) * 100;
        console.log(`\n   📈 Match rate: ${matchRate.toFixed(1)}%`);

        if (matchRate >= 70) {
            console.log('   ✅ PASS: Match rate ≥ 70%');
            testResults.passed++;
        } else {
            console.log('   ⚠️  WARNING: Match rate below 70%');
            testResults.warnings++;
        }
    } else {
        console.log('   ℹ️  No calendar events to validate');
    }

    // Step 5: Validate enrichment quality
    console.log('\n🔍 Step 5: Validating data enrichment...\n');

    const enrichmentStats = {
        dealsWithContacts: 0,
        dealsWithEmail: 0,
        dealsWithPhone: 0,
        dealsWithLastContact: 0,
        dealsWithSources: 0
    };

    renewals.forEach(renewal => {
        if (renewal.primaryContact) {
            enrichmentStats.dealsWithContacts++;
            if (renewal.primaryContact.email) enrichmentStats.dealsWithEmail++;
            if (renewal.primaryContact.phone) enrichmentStats.dealsWithPhone++;
        }

        if (renewal.communications?.lastContactDate) {
            enrichmentStats.dealsWithLastContact++;
        }

        if (renewal.sources?.hubspot?.dealId) {
            enrichmentStats.dealsWithSources++;
        }
    });

    console.log('📊 Enrichment Quality:');
    console.log(`   - Deals with primary contact: ${enrichmentStats.dealsWithContacts}/${renewals.length}`);
    console.log(`   - Deals with contact email: ${enrichmentStats.dealsWithEmail}/${renewals.length}`);
    console.log(`   - Deals with contact phone: ${enrichmentStats.dealsWithPhone}/${renewals.length}`);
    console.log(`   - Deals with last contact date: ${enrichmentStats.dealsWithLastContact}/${renewals.length}`);
    console.log(`   - Deals with source tracking: ${enrichmentStats.dealsWithSources}/${renewals.length}`);

    if (enrichmentStats.dealsWithContacts === renewals.length) {
        console.log('\n   ✅ PASS: All deals have contact information');
        testResults.passed++;
    } else {
        console.log('\n   ⚠️  WARNING: Some deals missing contact information');
        testResults.warnings++;
    }

    // Step 6: Sample detailed renewal inspection
    console.log('\n🔍 Step 6: Sample renewal inspection...\n');

    const sampleRenewal = renewals.find(r => r.communications?.totalTouchpoints > 0) || renewals[0];

    if (sampleRenewal) {
        console.log(`📋 Sample Renewal: ${sampleRenewal.clientName}`);
        console.log(`   ID: ${sampleRenewal.id}`);
        console.log(`   Premium: ₹${sampleRenewal.premium?.toLocaleString()}`);
        console.log(`   Expiry: ${sampleRenewal.expiryDate}`);
        console.log(`   Priority Score: ${sampleRenewal.priorityScore}`);
        console.log('');
        console.log('   Primary Contact:');
        console.log(`     - Name: ${sampleRenewal.primaryContact?.name || 'N/A'}`);
        console.log(`     - Email: ${sampleRenewal.primaryContact?.email || 'N/A'}`);
        console.log(`     - Phone: ${sampleRenewal.primaryContact?.phone || 'N/A'}`);
        console.log('');
        console.log('   Communications:');
        console.log(`     - Total Touchpoints: ${sampleRenewal.communications?.totalTouchpoints || 0}`);
        console.log(`     - Emails: ${sampleRenewal.communications?.emailCount || 0}`);
        console.log(`     - Meetings: ${sampleRenewal.communications?.meetingCount || 0}`);
        console.log(`     - Last Contact: ${sampleRenewal.communications?.lastContactDate || 'N/A'}`);

        if (sampleRenewal.communications?.recentEmails?.length > 0) {
            console.log('');
            console.log('   Recent Emails:');
            sampleRenewal.communications.recentEmails.slice(0, 3).forEach((email, i) => {
                console.log(`     ${i + 1}. ${email.subject}`);
                console.log(`        From: ${email.from}`);
                console.log(`        Date: ${email.date}`);
                if (email._matchScore) {
                    console.log(`        Match: ${email._matchReason} (score: ${email._matchScore})`);
                }
            });
        }

        testResults.passed++;
    }

    // Final Report
    console.log('\n' + '='.repeat(70));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(70));
    console.log('');
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`⚠️  Warnings: ${testResults.warnings}`);
    console.log('');

    // Performance metrics
    if (syncResult.duration) {
        console.log('⚡ Performance:');
        console.log(`   - Sync duration: ${syncResult.duration}ms`);

        if (syncResult.duration < 5000) {
            console.log(`   ✅ PASS: Sync completed in < 5 seconds`);
        } else {
            console.log(`   ⚠️  WARNING: Sync took > 5 seconds`);
        }
        console.log('');
    }

    // Overall status
    if (testResults.failed === 0) {
        console.log('🎉 OVERALL STATUS: PASS');
        console.log('');
        console.log('💡 Next Steps:');
        console.log('   1. Check frontend Communication Timeline display');
        console.log('   2. Generate AI briefs to verify context usage');
        console.log('   3. Review debug endpoint: http://localhost:4000/api/debug/orchestration');
        console.log('');
        process.exit(0);
    } else {
        console.log('❌ OVERALL STATUS: FAIL');
        console.log('');
        console.log('💡 Review failed tests and fix issues before proceeding');
        console.log('');
        process.exit(1);
    }
}

// Run the test
testOrchestration().catch(err => {
    console.error('\n💥 Fatal error:', err.message);
    console.error(err.stack);
    process.exit(1);
});
