const express = require('express');
const axios = require('axios');
const { auth } = require('../middleware/auth');

const router = express.Router();

const ML_URL = process.env.ML_URL || 'http://localhost:5001';

function calculateRiskScoreLocal(temp, usagePct, itemsExpiringSoon) {
  let score = 0;
  if (temp > 8) score += 4;
  else if (temp > 6) score += 2;
  if (usagePct > 85) score += 3;
  else if (usagePct > 70) score += 1;
  if (itemsExpiringSoon > 3) score += 3;
  else if (itemsExpiringSoon > 1) score += 2;
  score = Math.min(score, 10);

  let status = 'normal';
  if (score >= 7) status = 'critical';
  else if (score >= 4) status = 'warning';

  const alternatives = [];
  if (score > 5) {
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

router.post('/risk-score', auth, async (req, res) => {
  const { temp, usagePct, itemsExpiringSoon } = req.body;
  try {
    const response = await axios.post(`${ML_URL}/score`, { temp, usagePct, itemsExpiringSoon }, { timeout: 3000 });
    return res.json({ ...response.data, mlOnline: true });
  } catch (err) {
    console.warn('[ML] Flask unavailable, using local fallback:', err.message);
    const fallback = calculateRiskScoreLocal(temp || 4, usagePct || 50, itemsExpiringSoon || 0);
    return res.json({ ...fallback, mlOnline: false });
  }
});

module.exports = router;
