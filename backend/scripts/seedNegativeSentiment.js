import 'dotenv/config';
import { googleConnector } from '../src/connectors/google.js';
import { hubspotConnector } from '../src/connectors/hubspot.js';

async function seedNegativeSentiment() {
    console.log('📉 Seeding "Negative Sentiment" Email...');

    try {
        // 1. Get a Deal (GreenLogistics)
        const deals = await hubspotConnector.fetchDeals();
        const deal = deals.find(d => d.properties.dealname.includes('GreenLogistics'));

        if (!deal) {
            console.error('❌ Could not find GreenLogistics deal');
            return;
        }

        // 2. Prepare Email
        const emailData = {
            to: 'james134255@gmail.com', // User's email
            subject: `Concerns about the high premium - ${deal.properties.dealname}`,
            body: `Hi James,

I've been reviewing the renewal terms for the ${deal.properties.dealname}.

I have some serious concerns about the high premium increase this year. It seems very expensive compared to the market rate. 

We might need to look at other options or cancel if we can't get this down.

Please let me know if there's room for negotiation.

Regards,
Concerned Client`
        };

        // 3. Send
        console.log('📧 Sending email:', emailData.subject);
        const result = await googleConnector.sendEmail(emailData.to, emailData.subject, emailData.body);

        if (result.success) {
            console.log('✅ Email sent successfully!');
            console.log('👉 Now run: node scripts/testOrchestration.js');
        } else {
            console.error('❌ Failed to send:', result.error);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

seedNegativeSentiment();
