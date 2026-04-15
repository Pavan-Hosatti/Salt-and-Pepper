const express = require('express');
const { auth } = require('../middleware/auth');

const router = express.Router();

const resolvedActions = [];

router.post('/resolve', auth, (req, res) => {
  try {
    const { storeId, sku, action, savings } = req.body;
    if (!storeId || !sku || !action) {
      return res.status(400).json({ error: 'storeId, sku, and action are required.' });
    }
    const resolved = {
      id: `action_${Date.now()}`,
      storeId,
      sku,
      action,
      savings: savings || 0,
      resolvedAt: new Date().toISOString(),
      resolvedBy: req.user.email
    };
    resolvedActions.push(resolved);
    return res.json({ success: true, resolved });
  } catch (err) {
    console.error('[ACTIONS] Resolve error:', err.message);
    return res.status(500).json({ error: 'Failed to resolve action.' });
  }
});

router.get('/history', auth, (req, res) => {
  return res.json(resolvedActions);
});

module.exports = router;
