const express = require('express');
const { stores, getStoreAlerts } = require('../data/mockData');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, (req, res) => {
  try {
    let allAlerts = [];
    stores.forEach(store => {
      const alerts = getStoreAlerts(store);
      allAlerts = allAlerts.concat(alerts);
    });
    allAlerts.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return a.timeRemaining - b.timeRemaining;
    });
    return res.json(allAlerts);
  } catch (err) {
    console.error('[ALERTS] Error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch alerts.' });
  }
});

router.get('/:storeId', auth, (req, res) => {
  try {
    const store = stores.find(s => s._id === req.params.storeId);
    if (!store) return res.status(404).json({ error: 'Store not found.' });
    const alerts = getStoreAlerts(store);
    return res.json(alerts);
  } catch (err) {
    console.error('[ALERTS] Error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch store alerts.' });
  }
});

module.exports = router;
