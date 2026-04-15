const stores = [
  {
    _id: "store_01",
    name: "Koramangala",
    location: "Koramangala 4th Block, Bengaluru",
    ordersPerHour: 42,
    profitabilityScore: 64,
    coldStorageTemp: 9,
    coldStorageUsagePct: 91,
    skus: [
      { name: "Amul Milk 500ml", stock: 8, expiryHoursLeft: 3, dailySales: 35, costPrice: 28, shelfSlot: "A1", reorderPoint: 15 },
      { name: "Curd 200g", stock: 32, expiryHoursLeft: 5, dailySales: 1, costPrice: 22, shelfSlot: "A2", reorderPoint: 10 },
      { name: "Paneer 200g", stock: 4, expiryHoursLeft: 12, dailySales: 18, costPrice: 55, shelfSlot: "B1", reorderPoint: 8 },
      { name: "Brown Bread", stock: 28, expiryHoursLeft: 4, dailySales: 1, costPrice: 42, shelfSlot: "B2", reorderPoint: 5 },
      { name: "Eggs (6 pack)", stock: 45, expiryHoursLeft: 48, dailySales: 22, costPrice: 54, shelfSlot: "C1", reorderPoint: 20 },
      { name: "Yogurt Cup 100g", stock: 27, expiryHoursLeft: 6, dailySales: 1, costPrice: 18, shelfSlot: "B2", reorderPoint: 5 },
      { name: "Chicken 500g", stock: 3, expiryHoursLeft: 4, dailySales: 14, costPrice: 145, shelfSlot: "D1", reorderPoint: 6 },
      { name: "Butter 100g", stock: 15, expiryHoursLeft: 72, dailySales: 8, costPrice: 52, shelfSlot: "A3", reorderPoint: 5 }
    ]
  },
  {
    _id: "store_02",
    name: "Indiranagar",
    location: "100 Feet Road, Indiranagar, Bengaluru",
    ordersPerHour: 56,
    profitabilityScore: 78,
    coldStorageTemp: 5,
    coldStorageUsagePct: 62,
    skus: [
      { name: "Amul Milk 500ml", stock: 22, expiryHoursLeft: 18, dailySales: 40, costPrice: 28, shelfSlot: "A1", reorderPoint: 15 },
      { name: "Greek Yogurt", stock: 12, expiryHoursLeft: 24, dailySales: 6, costPrice: 65, shelfSlot: "A2", reorderPoint: 5 },
      { name: "Paneer 200g", stock: 18, expiryHoursLeft: 14, dailySales: 12, costPrice: 55, shelfSlot: "B1", reorderPoint: 8 },
      { name: "Sourdough Bread", stock: 5, expiryHoursLeft: 8, dailySales: 9, costPrice: 85, shelfSlot: "B2", reorderPoint: 4 },
      { name: "Eggs (12 pack)", stock: 30, expiryHoursLeft: 96, dailySales: 15, costPrice: 98, shelfSlot: "C1", reorderPoint: 10 },
      { name: "Almond Milk 1L", stock: 8, expiryHoursLeft: 120, dailySales: 4, costPrice: 180, shelfSlot: "A3", reorderPoint: 3 },
      { name: "Salmon 250g", stock: 6, expiryHoursLeft: 12, dailySales: 3, costPrice: 320, shelfSlot: "D1", reorderPoint: 3 },
      { name: "Hummus 200g", stock: 14, expiryHoursLeft: 48, dailySales: 5, costPrice: 120, shelfSlot: "B3", reorderPoint: 4 }
    ]
  },
  {
    _id: "store_03",
    name: "HSR Layout",
    location: "HSR Layout Sector 2, Bengaluru",
    ordersPerHour: 38,
    profitabilityScore: 52,
    coldStorageTemp: 9,
    coldStorageUsagePct: 88,
    skus: [
      { name: "Toned Milk 1L", stock: 6, expiryHoursLeft: 5, dailySales: 28, costPrice: 52, shelfSlot: "A1", reorderPoint: 12 },
      { name: "Curd 400g", stock: 35, expiryHoursLeft: 4, dailySales: 2, costPrice: 35, shelfSlot: "A2", reorderPoint: 8 },
      { name: "Cheese Slice", stock: 42, expiryHoursLeft: 72, dailySales: 1, costPrice: 28, shelfSlot: "B1", reorderPoint: 5 },
      { name: "Wheat Bread", stock: 22, expiryHoursLeft: 6, dailySales: 1, costPrice: 38, shelfSlot: "B2", reorderPoint: 5 },
      { name: "Eggs (6 pack)", stock: 18, expiryHoursLeft: 48, dailySales: 20, costPrice: 54, shelfSlot: "C1", reorderPoint: 10 },
      { name: "Mushrooms 200g", stock: 24, expiryHoursLeft: 3, dailySales: 1, costPrice: 42, shelfSlot: "C2", reorderPoint: 5 },
      { name: "Tofu 200g", stock: 3, expiryHoursLeft: 5, dailySales: 8, costPrice: 65, shelfSlot: "D1", reorderPoint: 4 },
      { name: "Mayonnaise 250g", stock: 10, expiryHoursLeft: 240, dailySales: 3, costPrice: 95, shelfSlot: "B3", reorderPoint: 3 }
    ]
  },
  {
    _id: "store_04",
    name: "Whitefield",
    location: "ITPL Main Road, Whitefield, Bengaluru",
    ordersPerHour: 61,
    profitabilityScore: 71,
    coldStorageTemp: 7,
    coldStorageUsagePct: 74,
    skus: [
      { name: "Amul Milk 500ml", stock: 30, expiryHoursLeft: 22, dailySales: 45, costPrice: 28, shelfSlot: "A1", reorderPoint: 18 },
      { name: "Flavored Yogurt", stock: 25, expiryHoursLeft: 8, dailySales: 1, costPrice: 32, shelfSlot: "A2", reorderPoint: 5 },
      { name: "Cottage Cheese", stock: 7, expiryHoursLeft: 10, dailySales: 10, costPrice: 72, shelfSlot: "B1", reorderPoint: 5 },
      { name: "Multigrain Bread", stock: 12, expiryHoursLeft: 14, dailySales: 7, costPrice: 58, shelfSlot: "B2", reorderPoint: 4 },
      { name: "Eggs (12 pack)", stock: 40, expiryHoursLeft: 96, dailySales: 30, costPrice: 98, shelfSlot: "C1", reorderPoint: 15 },
      { name: "Orange Juice 1L", stock: 9, expiryHoursLeft: 48, dailySales: 6, costPrice: 110, shelfSlot: "A3", reorderPoint: 4 },
      { name: "Prawns 250g", stock: 2, expiryHoursLeft: 3, dailySales: 5, costPrice: 280, shelfSlot: "D1", reorderPoint: 3 },
      { name: "Cream Cheese", stock: 15, expiryHoursLeft: 36, dailySales: 4, costPrice: 85, shelfSlot: "B3", reorderPoint: 3 }
    ]
  },
  {
    _id: "store_05",
    name: "JP Nagar",
    location: "JP Nagar 6th Phase, Bengaluru",
    ordersPerHour: 33,
    profitabilityScore: 45,
    coldStorageTemp: 10,
    coldStorageUsagePct: 93,
    skus: [
      { name: "Amul Milk 500ml", stock: 5, expiryHoursLeft: 2, dailySales: 30, costPrice: 28, shelfSlot: "A1", reorderPoint: 12 },
      { name: "Lassi 200ml", stock: 38, expiryHoursLeft: 3, dailySales: 1, costPrice: 25, shelfSlot: "A2", reorderPoint: 5 },
      { name: "Paneer 200g", stock: 2, expiryHoursLeft: 6, dailySales: 15, costPrice: 55, shelfSlot: "B1", reorderPoint: 6 },
      { name: "White Bread", stock: 30, expiryHoursLeft: 5, dailySales: 1, costPrice: 32, shelfSlot: "B2", reorderPoint: 5 },
      { name: "Eggs (6 pack)", stock: 12, expiryHoursLeft: 48, dailySales: 18, costPrice: 54, shelfSlot: "C1", reorderPoint: 8 },
      { name: "Buttermilk 500ml", stock: 22, expiryHoursLeft: 4, dailySales: 1, costPrice: 20, shelfSlot: "A3", reorderPoint: 5 },
      { name: "Fish Fillet 250g", stock: 1, expiryHoursLeft: 2, dailySales: 6, costPrice: 210, shelfSlot: "D1", reorderPoint: 3 },
      { name: "Ghee 200ml", stock: 8, expiryHoursLeft: 720, dailySales: 2, costPrice: 180, shelfSlot: "C2", reorderPoint: 2 }
    ]
  }
];

function calculateSKULoss(sku) {
  if (sku.dailySales < 2 && sku.stock > 20) {
    return sku.stock * sku.costPrice * 0.02;
  }
  return 0;
}

function calculateStoreLoss(store) {
  return store.skus.reduce((total, sku) => total + calculateSKULoss(sku), 0);
}

function getStoreAlerts(store) {
  const alerts = [];
  store.skus.forEach(sku => {
    const loss = calculateSKULoss(sku);
    if (loss > 0) {
      alerts.push({
        storeId: store._id,
        storeName: store.name,
        type: "silent_loss",
        severity: loss > 20 ? "critical" : "warning",
        sku: sku.name,
        shelfSlot: sku.shelfSlot,
        lossPerHour: parseFloat(loss.toFixed(2)),
        message: `₹${loss.toFixed(0)}/hr bleeding silently because ${sku.stock} ${sku.name} are blocking shelf slot ${sku.shelfSlot}`,
        timeRemaining: Math.min(sku.expiryHoursLeft, sku.stock / (store.ordersPerHour * 0.1 || 1)),
        createdAt: new Date().toISOString()
      });
    }

    const hasConflict = sku.stock < sku.reorderPoint && sku.expiryHoursLeft < 8;
    if (hasConflict) {
      const savedIfDiscount = sku.stock * sku.costPrice * 0.8;
      const lostIfIgnored = sku.stock * sku.costPrice;
      alerts.push({
        storeId: store._id,
        storeName: store.name,
        type: "conflict",
        severity: "critical",
        sku: sku.name,
        shelfSlot: sku.shelfSlot,
        stock: sku.stock,
        expiryHoursLeft: sku.expiryHoursLeft,
        recommendation: `Do NOT reorder. Run a 20% flash discount in the next ${sku.expiryHoursLeft} hours to clear ${sku.stock} units before expiry.`,
        savedIfFollowed: parseFloat(savedIfDiscount.toFixed(2)),
        lostIfIgnored: parseFloat(lostIfIgnored.toFixed(2)),
        timeRemaining: sku.expiryHoursLeft,
        message: `CONFLICT: ${sku.name} — stock below reorder point AND expiring in ${sku.expiryHoursLeft}h`,
        createdAt: new Date().toISOString()
      });
    }

    if (sku.expiryHoursLeft <= 6 && sku.stock > 0) {
      const alreadyHasAlert = alerts.find(a => a.sku === sku.name && a.storeId === store._id && (a.type === "silent_loss" || a.type === "conflict"));
      if (!alreadyHasAlert) {
        alerts.push({
          storeId: store._id,
          storeName: store.name,
          type: "expiry_warning",
          severity: sku.expiryHoursLeft <= 3 ? "critical" : "warning",
          sku: sku.name,
          shelfSlot: sku.shelfSlot,
          stock: sku.stock,
          expiryHoursLeft: sku.expiryHoursLeft,
          timeRemaining: sku.expiryHoursLeft,
          message: `${sku.name} — ${sku.stock} units expiring in ${sku.expiryHoursLeft}h`,
          createdAt: new Date().toISOString()
        });
      }
    }
  });
  return alerts;
}

function getNetworkLoss() {
  return stores.reduce((total, store) => total + calculateStoreLoss(store), 0);
}

module.exports = { stores, calculateSKULoss, calculateStoreLoss, getStoreAlerts, getNetworkLoss };
