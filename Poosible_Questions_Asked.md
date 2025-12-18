# Possible Questions Asked (FAQs)

This document covers potential questions from technical reviewers, stakeholders, or curious users about the inner workings of Broker Copilot.

## Architecture & Security

### 1. How do you handle authentication securely?
We use OAuth 2.0 for both Google and HubSpot. For security, we implement an **"Incognito Persistence"** strategy. Tokens are encrypted using **AES-256-GCM** while in memory and only stored in an encrypted file during the active session. Once the server shuts down, the encryption keys are wiped, effectively "forgetting" the session for maximum data privacy.

### 2. What happens if the backend server crashes?
We have a **Backend Connectivity Guard**. The frontend pings the server every 5 seconds (heartbeat). If the server is unreachable, a full-screen "Offline" overlay appears, preventing users from seeing incomplete data. It automatically reconnects and refreshes the data as soon as the server is back online.

---

## Data & Logic

### 3. How does the Priority Score actually work?
The score (1-100) is calculated in `scoreCalculator.jsx` based on five weighted factors:
- **Time Sensitivity**: Days remaining until renewal.
- **Deal Value**: Total premium amount.
- **Engagement (The "Ghosting" Factor)**: The ratio of sent emails vs. received replies.
- **Stage Progress**: How far the deal is in the HubSpot pipeline.
- **Context Quality**: Volume of relevant communication threads found.

### 4. How do you match Gmail/Calendar data to HubSpot deals?
We use a multi-layered matching engine:
1. **Email Match**: Direct match of the sender/recipient email to a HubSpot contact.
2. **Domain Match**: If no email match, we look at the `@company.com` domain.
3. **Keyword Match**: We scan subjects and bodies for the deal name or policy numbers.

---

## AI & Integration

### 5. Which AI model are you using for the briefs?
We use **Google Gemini 1.5 Flash**. It was chosen for its massive context window (allowing us to feed it long email threads) and its high speed for generating real-time "Strategy Briefs."

### 6. Can I send emails directly from the app?
Yes. The app identifies the correct recipient from the HubSpot deal and Gmail history, lets you pick a personalized template, and sends it via the Gmail API, ensuring the outreach appears in your "Sent" folder like a normal email.

---

## Performance

### 7. Does the app slow down with thousands of deals?
The frontend uses **React virtualization** patterns and narrow state updates. The backend performs "Lazy Loading" for AI briefs—only generating the analysis when a specific renewal is selected—to save API costs and improve performance.

---
*Last updated: December 2025*
