const express = require('express');
const axios = require('axios');
const { auth } = require('../middleware/auth');

const router = express.Router();

const ML_URL = process.env.ML_URL || 'http://localhost:5001';

const { calculateRiskScoreLocal } = require('../utils/scoring');

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
