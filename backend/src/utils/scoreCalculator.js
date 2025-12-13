// backend/src/utils/scoreCalculator.js

/**
 * Compute priority score for a renewal item using normalized weighted components
 * @param {Object} item - Renewal item with premium, commission, and limit data
 * @returns {Object} - { value: number, breakdown: Object }
 */
export function computeScore(item) {
  // Min values from original Python DataFrame for scaling
  const MIN_VALUES = {
    'Total Premium': 0.0,
    'Coverage Premium Amount': 0.0,
    'Comission Amount': 0.0,
    'Limit': 0.0,
    'Comission %': 1.0,
  };

  // Max values from original Python DataFrame for scaling
  const MAX_VALUES = {
    'Total Premium': 1.016666e+07,
    'Coverage Premium Amount': 9.497513e+06,
    'Comission Amount': 1.595200e+06,
    'Limit': 3.857328e+08,
    'Comission %': 20.0,
  };

  // Optimized weights (from Python analysis - Iteration 3's best result)
  const OPTIMIZED_WEIGHTS = {
    'Total Premium_normalized': 0.0500,
    'Coverage Premium Amount_normalized': 0.0500,
    'Comission Amount_normalized': 0.0500,
    'Limit_normalized': 0.2178,
    'Comission %_normalized': 0.6322,
  };

  let weightedScore = 0;
  const breakdown = {};
  const normalizedBreakdown = {};

  // Define mapping from Python column names to Javascript item properties
  // Updated to match actual HubSpot data structure
  const columnMapping = {
    'Total Premium': 'premium',
    'Coverage Premium Amount': 'coveragePremium',
    'Comission Amount': 'commissionAmount',
    'Limit': 'policyLimit',
    'Comission %': 'commissionPercent',
  };

  // Helper function to extract nested values
  const getValue = (item, path) => {
    if (!path) return 0;
    
    // Handle direct property access
    if (typeof path === 'string' && !path.includes('.')) {
      return item[path] || 0;
    }
    
    // Handle nested property access (e.g., 'sources.hubspot.amount')
    if (typeof path === 'string' && path.includes('.')) {
      return path.split('.').reduce((obj, key) => obj?.[key], item) || 0;
    }
    
    return 0;
  };

  // Iterate over the columns used in the priority score
  for (const pyColName in columnMapping) {
    const propertyPath = columnMapping[pyColName];
    const normalizedPyColName = `${pyColName}_normalized`;

    // Get raw value from item, default to 0 if not present
    const rawValue = getValue(item, propertyPath);

    const min = MIN_VALUES[pyColName];
    const max = MAX_VALUES[pyColName];
    const weight = OPTIMIZED_WEIGHTS[normalizedPyColName];

    let normalizedValue;
    if (max - min === 0) {
      normalizedValue = 0; // Avoid division by zero
    } else {
      normalizedValue = (rawValue - min) / (max - min);
    }
    
    // Clamp normalized value between 0 and 1
    normalizedValue = Math.max(0, Math.min(1, normalizedValue));

    const weightedComponent = normalizedValue * weight;

    weightedScore += weightedComponent;
    
    // Store breakdown using simplified property names
    const breakdownKey = propertyPath ? propertyPath.replace('.', '_') : pyColName.toLowerCase().replace(/ /g, '_');
    breakdown[breakdownKey] = weightedComponent;
    normalizedBreakdown[`${breakdownKey}_normalized`] = normalizedValue;
  }

  // Convert to 0-100 scale with 3 decimal places
  const value = parseFloat((weightedScore * 100).toFixed(3));

  return {
    value,
    breakdown: { ...breakdown, ...normalizedBreakdown }
  };
}

/**
 * Add priority scores to a list of renewal items and sort by priority
 * @param {Array} list - Array of renewal items
 * @returns {Array} - Sorted array with priorityScore and _scoreBreakdown added
 */
export function withScores(list) {
  return list
    .map((item) => {
      const scoreData = computeScore(item);
      return {
        ...item,
        priorityScore: scoreData.value,
        _scoreBreakdown: scoreData.breakdown,
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * Verify which columns from the expected mapping are available in the item
 * @param {Object} item - Renewal item to inspect
 * @returns {Object} - { available: Array, missing: Array }
 */
function verifyColumns(item) {
  const columnMapping = {
    'Total Premium': 'premium',
    'Coverage Premium Amount': 'coveragePremium',
    'Comission Amount': 'commissionAmount',
    'Limit': 'policyLimit',
    'Comission %': 'commissionPercent',
  };

  const available = [];
  const missing = [];

  // Helper function to check if nested path exists
  const pathExists = (obj, path) => {
    if (!path) return false;
    if (!path.includes('.')) {
      return obj.hasOwnProperty(path) && obj[path] != null;
    }
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
      if (current == null || !current.hasOwnProperty(key)) return false;
      current = current[key];
    }
    return current != null;
  };

  for (const [columnName, propertyPath] of Object.entries(columnMapping)) {
    if (propertyPath && pathExists(item, propertyPath)) {
      available.push({ column: columnName, property: propertyPath, value: item[propertyPath] });
    } else {
      missing.push({ column: columnName, property: propertyPath || 'NOT MAPPED' });
    }
  }

  return { available, missing };
}

/**
 * Log item structure for debugging and mapping purposes
 * @param {Object} item - Renewal item to inspect
 */
export function logItemStructure(item) {
  const { available, missing } = verifyColumns(item);
  
  console.log(`\n📊 Scoring Fields: ${available.length}/5 available`);
  
  if (missing.length > 0) {
    console.log(`⚠️  Missing: ${missing.map(m => m.column).join(', ')}`);
  } else {
    console.log('✅ All scoring fields present\n');
  }
}