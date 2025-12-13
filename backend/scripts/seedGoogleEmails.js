import axios from 'axios';

const API_BASE = 'http://localhost:4000';

const testEmails = [
  {
    to: 'jaiadithya2020@gmail.com',
    subject: 'Acme Manufacturing - Insurance Renewal Discussion',
    body: `Hi Ananya,

I hope this email finds you well. I wanted to follow up on your Property Insurance policy renewal coming up in February.

Could we schedule a brief call to discuss your current coverage and any changes in your business operations?

Best regards,
Insurance Broker`,
    renewalId: 'R-12345001'
  },
  {
    to: 'jaiadithya2020@gmail.com',
    subject: 'TechCorp Cyber Liability - Policy Expiry Reminder',
    body: `Dear Rahul,

Your Cyber Liability policy is due for renewal on December 20th. Given the approaching deadline, I'd like to schedule a meeting to review your coverage options.

Please let me know your availability this week.

Thanks,
Broker Team`,
    renewalId: 'R-12345002'
  },
  {
    to: 'jaiadithya2020@gmail.com',
    subject: 'GreenLogistics Marine Cargo - Quote Request',
    body: `Hi Priya,

Following our last conversation, I'm sending over the renewal quote for your Marine Cargo coverage.

The premium this year is ₹420,000 with improved coverage terms. Let's discuss when convenient.

Regards`,
    renewalId: 'R-12345003'
  },
  {
    to: 'jaiadithya2020@gmail.com',
    subject: 'Sunrise Foods GL Policy - Renewal Timeline',
    body: `Dear Vikram,

Your General Liability policy expires on December 30th. I wanted to reach out early to ensure we have adequate time for the renewal process.

Can we schedule a call next week?

Best`,
    renewalId: 'R-12345004'
  },
  {
    to: 'jaiadithya2020@gmail.com',
    subject: 'BlueSky Consulting - Professional Indemnity Review',
    body: `Hi Meera,

It's time to review your Professional Indemnity coverage ahead of the March renewal. I have some competitive quotes to share.

Looking forward to connecting soon.

Cheers`,
    renewalId: 'R-12345005'
  }
];

async function sendTestEmails() {
  console.log('📧 Starting Gmail test email seeding via API...\n');
  console.log(`📍 Target: ${API_BASE}`);
  console.log(`📬 Recipient: ${testEmails[0].to}\n`);

  // Check if server is running
  try {
    await axios.get(`${API_BASE}/`);
    console.log('✅ Backend server is running\n');
  } catch (error) {
    console.error('❌ Backend server is not running!');
    console.log('\n💡 Start the backend first:');
    console.log('   cd backend');
    console.log('   npm run dev\n');
    process.exit(1);
  }

  // Check if Google is connected
  try {
    const statusResponse = await axios.get(`${API_BASE}/auth/status`);
    if (!statusResponse.data.google) {
      console.error('❌ Google is not connected!\n');
      console.log('💡 Connect Google first:');
      console.log('   1. Open frontend: http://localhost:3000');
      console.log('   2. Click "Connect" on Google connector');
      console.log('   3. Authorize Gmail access');
      console.log('   4. Run this script again\n');
      process.exit(1);
    }
    console.log('✅ Google is connected\n');
  } catch (error) {
    console.error('❌ Failed to check connection status:', error.message);
    process.exit(1);
  }

  let successCount = 0;
  let failCount = 0;
  const sentEmails = [];

  console.log('📤 Sending test emails...\n');

  for (const email of testEmails) {
    try {
      console.log(`   Sending: ${email.subject}`);
      
      const response = await axios.post(`${API_BASE}/api/send-email`, {
        to: email.to,
        subject: email.subject,
        body: email.body,
        renewalId: email.renewalId
      });

      if (response.data.success) {
        console.log(`   ✅ Sent! Message ID: ${response.data.messageId}`);
        successCount++;
        sentEmails.push({
          subject: email.subject,
          messageId: response.data.messageId
        });
      } else {
        console.log(`   ❌ Failed: ${response.data.error}`);
        failCount++;
      }

      // Rate limiting - wait 2 seconds between emails
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.response?.data?.error || error.message}`);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ Email seeding complete!');
  console.log('='.repeat(60));
  console.log(`📊 Results:`);
  console.log(`   ✅ Successfully sent: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📬 Total attempted: ${testEmails.length}`);
  
  if (sentEmails.length > 0) {
    console.log('\n📧 Sent emails:');
    sentEmails.forEach((email, i) => {
      console.log(`   ${i + 1}. ${email.subject}`);
      console.log(`      Message ID: ${email.messageId}`);
    });
  }

  console.log('\n💡 Next steps:');
  console.log('   1. Check your inbox');
  console.log('   2. Click "🔄 Sync Data" in the frontend');
  console.log('   3. View emails in Communication History\n');
}

sendTestEmails().catch(err => {
  console.error('\n💥 Fatal error:', err.message);
  process.exit(1);
});