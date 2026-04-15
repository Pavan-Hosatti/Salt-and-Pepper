export const MOCK_STORES = [
  {
    _id: 'store_01',
    name: 'Koramangala - Node 01',
    location: 'Koramangala 4th Block Cluster',
    lossPerHour: 4520,
    activeAlerts: 4,
    ordersPerHour: 142,
    profitabilityScore: 78,
    itemsExpiringSoon: 12,
    coldStorageTemp: 8.2,
    coldStorageUsagePct: 88,
    coldStorageRiskScore: 9,
    skus: [
      { name: 'Organic Milk 1L', sku: 'MILK-ORG-01', stock: 12, velocity: 'High', expiryHoursLeft: 4, status: 'Critical' },
      { name: 'Frozen Berries 500g', sku: 'FRZ-BER-99', stock: 45, velocity: 'Medium', expiryHoursLeft: 480, status: 'Stable' },
      { name: 'Greek Yogurt', sku: 'YOG-GRK-05', stock: 5, velocity: 'High', expiryHoursLeft: 2, status: 'Critical' },
      { name: 'Cold Press Juice', sku: 'JCE-CP-12', stock: 18, velocity: 'Medium', expiryHoursLeft: 12, status: 'Warning' },
    ],
    alerts: [
      { type: 'silent_loss', sku: 'MILK-ORG-01', storeName: 'Koramangala', severity: 'critical', message: 'Inventory deviation detected in Zone B (Freezer Logic Gap).', recommendation: 'Relocate to Secondary Cooler', savedIfFollowed: 12000, lostIfIgnored: 45000, storeId: 'store_01', timeRemaining: 1.5, shelfSlot: 'Freezer A1' },
      { type: 'conflict', sku: 'YOG-GRK-05', storeName: 'Koramangala', severity: 'critical', message: 'Price override conflict between Local Agent and Global Poly.', recommendation: 'Force Global Pricing', savedIfFollowed: 4500, lostIfIgnored: 8200, storeId: 'store_01', timeRemaining: 0.8, shelfSlot: 'Dairy B4' },
      { type: 'expiry_warning', sku: 'MILK-ORG-22', storeName: 'Koramangala', severity: 'warning', message: 'Terminal expiry approaching for dairy batch #441.', recommendation: 'Dynamic Mark-down 40%', savedIfFollowed: 3200, lostIfIgnored: 5500, storeId: 'store_01', timeRemaining: 3.2, shelfSlot: 'Chill-Zone C' },
    ]
  },
  {
    _id: 'store_02',
    name: 'Indiranagar - Node 02',
    location: '100 Feet Road Cluster',
    lossPerHour: 1250,
    activeAlerts: 1,
    ordersPerHour: 210,
    profitabilityScore: 92,
    itemsExpiringSoon: 2,
    coldStorageTemp: 4.5,
    coldStorageUsagePct: 42,
    coldStorageRiskScore: 2,
    skus: [
      { name: 'Fresh Paneer 200g', sku: 'PNR-FSH-01', stock: 50, velocity: 'High', expiryHoursLeft: 120, status: 'Stable' },
      { name: 'Almond Milk', sku: 'MLK-ALM-02', stock: 15, velocity: 'Low', expiryHoursLeft: 12, status: 'Warning' },
    ],
    alerts: [
      { type: 'expiry_warning', sku: 'MLK-ALM-02', storeName: 'Indiranagar', severity: 'warning', message: 'Stock nearing terminal expiry (12h remaining).', recommendation: 'Apply 50% Flash Discount', savedIfFollowed: 2200, lostIfIgnored: 4000, storeId: 'store_02', timeRemaining: 12, shelfSlot: 'Shelf 01' },
    ]
  },
  {
    _id: 'store_03',
    name: 'HSR Layout - Node 03',
    location: 'HSR Sector 2 Cluster',
    lossPerHour: 3890,
    activeAlerts: 2,
    ordersPerHour: 95,
    profitabilityScore: 65,
    itemsExpiringSoon: 5,
    coldStorageTemp: 12.5,
    coldStorageUsagePct: 95,
    coldStorageRiskScore: 10,
    skus: [],
    alerts: [
      { type: 'silent_loss', sku: 'HEAT-THRM-01', storeName: 'HSR Layout', severity: 'critical', message: 'Thermal sensor anomaly: Core temperature rising rapidly (+4°C/hr).', recommendation: 'Activate Auxiliary Cooling', savedIfFollowed: 85000, lostIfIgnored: 120000, storeId: 'store_03', timeRemaining: 0.5, shelfSlot: 'Main Walk-in' },
    ]
  },
  {
    _id: 'store_04',
    name: 'Whitefield - Node 04',
    location: 'ITPL Main Road Cluster',
    lossPerHour: 800,
    activeAlerts: 0,
    ordersPerHour: 310,
    profitabilityScore: 98,
    itemsExpiringSoon: 1,
    coldStorageTemp: 3.2,
    coldStorageUsagePct: 55,
    coldStorageRiskScore: 1,
    skus: [],
    alerts: []
  },
  {
    _id: 'store_05',
    name: 'JP Nagar - Node 05',
    location: 'JP Nagar 6th Phase Cluster',
    lossPerHour: 1800,
    activeAlerts: 1,
    ordersPerHour: 180,
    profitabilityScore: 88,
    itemsExpiringSoon: 8,
    coldStorageTemp: 5.1,
    coldStorageUsagePct: 70,
    coldStorageRiskScore: 4,
    skus: [],
    alerts: [
      { type: 'conflict', sku: 'SKU-LOG-99', storeName: 'JP Nagar', severity: 'warning', message: 'Logistics delay detected: Supplier sync mismatch (4hr gap).', recommendation: 'Trigger Secondary Sourcing', savedIfFollowed: 15400, lostIfIgnored: 22000, storeId: 'store_05', timeRemaining: 4, shelfSlot: 'Inbound Bay' },
    ]
  },
  {
    _id: 'store_06',
    name: 'BTM Layout - Node 06',
    location: 'BTM 2nd Stage Cluster',
    lossPerHour: 3100,
    activeAlerts: 2,
    ordersPerHour: 125,
    profitabilityScore: 71,
    itemsExpiringSoon: 15,
    coldStorageTemp: 6.8,
    coldStorageUsagePct: 82,
    coldStorageRiskScore: 6,
    skus: [
      { name: 'Cold Coffee 200ml', sku: 'COF-CLD-11', stock: 24, velocity: 'Medium', expiryHoursLeft: 6, status: 'Warning' }
    ],
    alerts: [
      { type: 'expiry_warning', sku: 'COF-CLD-11', storeName: 'BTM Layout', severity: 'critical', message: 'High volume dairy beverage reaching terminal expiry.', recommendation: 'Dynamic Mark-down 60%', savedIfFollowed: 4800, lostIfIgnored: 8000, storeId: 'store_06', timeRemaining: 6, shelfSlot: 'Chill-Zone A' }
    ]
  },
  {
    _id: 'store_07',
    name: 'Jayanagar - Node 07',
    location: 'Jayanagar 4th Block Cluster',
    lossPerHour: 950,
    activeAlerts: 0,
    ordersPerHour: 240,
    profitabilityScore: 94,
    itemsExpiringSoon: 3,
    coldStorageTemp: 4.1,
    coldStorageUsagePct: 50,
    coldStorageRiskScore: 2,
    skus: [],
    alerts: []
  }
];

export const MOCK_LOSS = {
  totalLossPerHour: 12260,
  savingsPotential: 124800,
  lastUpdate: new Date().toISOString()
};

export const MOCK_STATUS = {
  isDemoMode: true,
  mlOnline: true,
  agentActive: true
};

export const MOCK_ALERTS = MOCK_STORES.flatMap(s => s.alerts);

export const MOCK_RISK_SCORE = {
  riskScore: 8,
  status: 'critical',
  mlOnline: true,
  alternatives: [
    { action: 'Increase Freezer Load (Phase 2)', recommendation: 'high', cost: 1200, savings: 8500 },
    { action: 'Manual Stock Relocation', recommendation: 'medium', cost: 400, savings: 3000 },
    { action: 'Emergency Maintenance Ping', recommendation: 'high', cost: 5000, savings: 45000 }
  ]
};
