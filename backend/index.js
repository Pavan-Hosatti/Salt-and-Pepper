const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB, getDbStatus } = require('./config/db');
const authRoutes = require('./routes/auth');
const storeRoutes = require('./routes/stores');
const alertRoutes = require('./routes/alerts');
const actionRoutes = require('./routes/actions');
const mlRoutes = require('./routes/ml');
const { getNetworkLoss, stores, calculateStoreLoss } = require('./data/mockData');
const { auth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  const { isDemoMode } = getDbStatus();
  res.json({ status: 'OK', demoMode: isDemoMode });
});

app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api', mlRoutes);

app.get('/api/loss', auth, (req, res) => {
  try {
    const totalLoss = getNetworkLoss();
    const storeLosses = stores.map(s => ({
      _id: s._id,
      name: s.name,
      lossPerHour: parseFloat(calculateStoreLoss(s).toFixed(2))
    }));
    return res.json({
      totalLossPerHour: parseFloat(totalLoss.toFixed(2)),
      stores: storeLosses
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to calculate network loss.' });
  }
});

app.get('/api/status', (req, res) => {
  const { isDemoMode, isConnected } = getDbStatus();
  res.json({ isDemoMode, isConnected });
});

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    const { isDemoMode } = getDbStatus();
    console.log(`[SERVER] StoreOS Backend running on port ${PORT}`);
    if (isDemoMode) console.log('[SERVER] Running in DEMO MODE — using mock data');
  });
};

start();
