export function validatePolicyDetails(data) {
  const requiredFields = [
    "policyNumber",
    "customerName",
    "policyType"
  ];

  const missingFields = requiredFields.filter(
    field => !data[field] || data[field].toString().trim() === ""
  );

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}
