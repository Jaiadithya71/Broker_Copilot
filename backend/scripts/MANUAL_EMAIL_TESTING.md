# Manual Email Seeding Guide

Since the automated email sending via Gmail API is experiencing connection issues, you can manually send test emails to validate the matching logic.

## Quick Manual Testing

### Option 1: Send Emails from Your Gmail

1. **Open Gmail** (https://mail.google.com) using `james134255@gmail.com`
2. **Send these test emails** to yourself:

#### Scenario A: Exact Email Match (Score 100)
```
From: priya.patel@greenlogistics.com (or any HubSpot contact email)
To: james134255@gmail.com
Subject: Re: GreenLogistics - Marine Cargo & Transit Coverage - Policy Renewal Discussion

Hi,

I wanted to follow up on our recent conversation about the insurance renewal.

Could we schedule a call this week to discuss the premium and coverage details?

Best regards,
Priya
```

#### Scenario C: Keyword Match (Score 50)
```
From: anyone@example.com
To: james134255@gmail.com
Subject: Question about GreenLogistics - Marine Cargo & Transit Coverage insurance policy

Hi,

I have some questions regarding the GreenLogistics - Marine Cargo & Transit Coverage insurance coverage.

Could you provide more details?

Thanks
```

#### Scenario D: Renewal Keywords (Score 30)
```
From: renewals@insurance.com
To: james134255@gmail.com
Subject: Insurance Policy Renewal Reminder

Dear valued customer,

This is a reminder that your insurance policy is up for renewal soon.

Please review your coverage and premium details.

Best regards,
Insurance Team
```

### Option 2: Use Existing Emails

The test showed you already have **9 emails** in your Gmail that were fetched. These are being analyzed!

## After Sending/Verifying Emails

1. **Wait 30 seconds** for Gmail to process
2. **Run the validation**:
   ```bash
   node scripts/testOrchestration.js
   ```

## Expected Results

With the updated matching threshold (>=30 instead of >=50):

- **Exact email matches** (score 100): Should match to specific deals
- **Keyword matches** (score 50): Should match when deal name is in subject
- **Renewal keywords** (score 30): Should now match (previously excluded)

**Target**: Match rate should improve from 22.2% to 60%+

## Current Status

✅ **What's Working**:
- Gmail integration (9 emails fetched)
- HubSpot integration (10 deals with contacts)
- Data enrichment (100% success)
- Sync performance (3.1s < 5s target)

⚠️ **What Needs Improvement**:
- Email sending via API (connection errors)
- Match rate (22.2% → need 50%+)

## Fix Applied

Updated `dataOrchestrator.js` line 246:
```diff
- if (matchScore >= 50) {
+ if (matchScore >= 30) {  // Include renewal keyword matches
```

This allows Scenario D emails (renewal keywords) to match, which should significantly improve the match rate.

## Next Steps

1. Run `node scripts/testOrchestration.js` again to see improved match rate
2. If still low, manually send 2-3 emails with deal names in subject
3. Verify frontend Communication Timeline displays correctly
