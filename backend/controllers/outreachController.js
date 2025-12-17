import { validatePolicyDetails } from "../utils/validatePolicyDetails.js";

export async function generateOutreachEmail(req, res) {
  const policyData = req.body;

  const validation = validatePolicyDetails(policyData);

  if (!validation.isValid) {
    return res.status(400).json({
      error: "Mandatory policy details missing",
      missingFields: validation.missingFields
    });
  }

  const prompt = `
You are an insurance assistant.

Generate a professional outreach email.
You MUST include the policy number exactly as given.

Policy Number: ${policyData.policyNumber}
Customer Name: ${policyData.customerName}
Policy Type: ${policyData.policyType}

If policy number is missing, do not generate the email.
`;

  const email = await generateEmailFromAI(prompt);

  res.json({ email });
}
