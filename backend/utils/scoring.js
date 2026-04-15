/**
 * Shared scoring utility to ensure consistency between ML service fallback and Store logic.
 */

function calculateRiskScoreLocal(temp, usagePct, itemsExpiringSoon) {
  let score = 0;
  
  // Temperature weights (Prompt: temp > 8 -> 4, temp > 6 -> 2)
  if (temp > 8) score += 4;
  else if (temp > 6) score += 2;

  // Usage weights (Prompt: usage > 85 -> 3, usage > 70 -> 1)
  if (usagePct > 85) score += 3;
  else if (usagePct > 70) score += 1;

  // Expiry weights (Prompt: items > 3 -> 3, items > 1 -> 2)
  if (itemsExpiringSoon > 3) score += 3;
  else if (itemsExpiringSoon > 1) score += 2;

  score = Math.min(score, 10);

  let status = 'normal';
  if (score >= 7) status = 'critical';
  else if (score >= 4) status = 'warning';

  const alternatives = [];
  if (score > 5) {
    // Real calculated values as per prompt requirements
    const discountSavings = itemsExpiringSoon * 45;
    const transferCost = itemsExpiringSoon * 12;
    const projectedLoss = itemsExpiringSoon * 65;

    alternatives.push({
      action: 'Flash discount perishables',
      cost: parseFloat((itemsExpiringSoon * 10).toFixed(2)),
      savings: parseFloat(discountSavings.toFixed(2)),
      recommendation: itemsExpiringSoon > 3 ? 'high' : 'medium'
    });
    alternatives.push({
      action: 'Transfer to nearby store',
      cost: parseFloat(transferCost.toFixed(2)),
      savings: parseFloat((projectedLoss * 0.6).toFixed(2)),
      recommendation: usagePct > 85 ? 'medium' : 'low'
    });
    alternatives.push({
      action: 'Accept projected loss',
      cost: 0,
      savings: 0,
      recommendation: 'low'
    });
  }

  return { riskScore: score, status, alternatives };
}

module.exports = { calculateRiskScoreLocal };
