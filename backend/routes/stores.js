const express = require('express');
const { stores, calculateStoreLoss, getStoreAlerts } = require('../data/mockData');
const { calculateRiskScoreLocal } = require('../utils/scoring');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, (req, res) => {
  try {
    const storesSummary = stores.map(store => {
      const lossPerHour = calculateStoreLoss(store);
      const alerts = getStoreAlerts(store);
      const itemsExpiringSoon = store.skus.filter(s => s.expiryHoursLeft <= 6).length;
      const { riskScore } = calculateRiskScoreLocal(store.coldStorageTemp, store.coldStorageUsagePct, itemsExpiringSoon);
      return {
        _id: store._id,
        name: store.name,
        location: store.location,
        ordersPerHour: store.ordersPerHour,
        profitabilityScore: store.profitabilityScore,
        coldStorageTemp: store.coldStorageTemp,
        coldStorageUsagePct: store.coldStorageUsagePct,
        lossPerHour: parseFloat(lossPerHour.toFixed(2)),
        activeAlerts: alerts.length,
        itemsExpiringSoon,
        coldStorageRiskScore: riskScore
      };
    });
    return res.json(storesSummary);
  } catch (err) {
    console.error('[STORES] Error fetching stores:', err.message);
    return res.status(500).json({ error: 'Failed to fetch stores.' });
  }
});

router.get('/:id', auth, (req, res) => {
  try {
    const store = stores.find(s => s._id === req.params.id);
    if (!store) return res.status(404).json({ error: 'Store not found.' });

    const lossPerHour = calculateStoreLoss(store);
    const alerts = getStoreAlerts(store);
    const itemsExpiringSoon = store.skus.filter(s => s.expiryHoursLeft <= 6).length;

    const skusWithLoss = store.skus.map(sku => {
      const loss = (sku.dailySales < 2 && sku.stock > 20) ? sku.stock * sku.costPrice * 0.02 : 0;
      return { ...sku, lossContribution: parseFloat(loss.toFixed(2)) };
    });

    const { riskScore } = calculateRiskScoreLocal(store.coldStorageTemp, store.coldStorageUsagePct, itemsExpiringSoon);

    return res.json({
      ...store,
      skus: skusWithLoss,
      lossPerHour: parseFloat(lossPerHour.toFixed(2)),
      alerts,
      itemsExpiringSoon,
      coldStorageRiskScore: riskScore
    });
  } catch (err) {
    console.error('[STORES] Error fetching store:', err.message);
    return res.status(500).json({ error: 'Failed to fetch store.' });
  }
});

module.exports = router;
