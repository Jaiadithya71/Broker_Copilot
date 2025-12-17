import 'dotenv/config';
import { dataOrchestrator } from '../src/services/dataOrchestrator.js';
import { hubspotConnector } from '../src/connectors/hubspot.js';

async function runStressTest() {
    console.log('🚀 Running Orchestration Stress Test (Phase 6)...');
    console.log('==================================================');

    // 1. Mock Data (Simulating 50 emails)
    console.log('📦 Generating 50 mock emails...');

    const baseEmails = [
        {
            subject: 'Re: GreenLogistics Policy Renewal',
            from: 'Green Logistics <contact@greenlogistics.com>',
            fromEmail: 'contact@greenlogistics.com',
            domain: 'greenlogistics.com',
            date: new Date().toISOString(),
            timestamp: Date.now(),
            snippet: 'Discussing the renewal terms...',
            id: 'mock-1'
        },
        {
            subject: 'BlueSky Liability Coverage',
            from: 'BlueSky Admin <admin@bluesky.com>',
            fromEmail: 'admin@bluesky.com',
            domain: 'bluesky.com',
            date: new Date().toISOString(),
            timestamp: Date.now(),
            snippet: 'Please send the certificate...',
            id: 'mock-2'
        }
    ];

    const mockEmails = [];
    for (let i = 0; i < 50; i++) {
        const base = baseEmails[i % 2];
        mockEmails.push({
            ...base,
            id: `stress-test-${i}`,
            subject: `${base.subject} - # ${i}`
        });
    }
    console.log(`✅ Generated ${mockEmails.length} mock emails.`);

    // 2. Fetch Deals (Real fetch to benchmark matching logic against real deals)
    console.log('🔄 Fetching real HubSpot deals...');
    const deals = await hubspotConnector.fetchDealsWithContacts();
    console.log(`✅ Fetched ${deals.length} deals.`);

    // 3. Measure Matching Performance
    console.log('⚡ Starting Matching Engine Stress Test...');
    const start = performance.now();

    const results = await dataOrchestrator.matchAndEnrich(deals, mockEmails, []);

    const end = performance.now();
    const duration = (end - start).toFixed(2);

    // 4. Report Results
    console.log('==================================================');
    console.log(`🏁 Stress Test Complete`);
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`📊  Items Processed: ${deals.length} deals x ${mockEmails.length} emails`);
    console.log(`📈  Average Time per Email: ${(duration / 50).toFixed(2)}ms`);

    if (duration < 5000) {
        console.log('✅ PASS: Performance is within acceptable limits (<5000ms)');
    } else {
        console.log('⚠️ WARN: Performance exceeded 5s target');
    }

    // Verification
    const matchedDeals = results.filter(d => d.communications.emailCount > 0);
    console.log(`✅ ${matchedDeals.length} deals matched with stress data.`);
}

runStressTest();
