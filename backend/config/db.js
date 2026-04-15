const mongoose = require('mongoose');

let isConnected = false;
let isDemoMode = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[DB] No MONGODB_URI found — running in DEMO MODE');
    isDemoMode = true;
    return;
  }
  try {
    await mongoose.connect(uri);
    isConnected = true;
    isDemoMode = false;
    console.log('[DB] MongoDB connected successfully');
  } catch (err) {
    console.error('[DB] MongoDB connection failed:', err.message);
    console.log('[DB] Falling back to DEMO MODE with mock data');
    isDemoMode = true;
  }
};

const getDbStatus = () => ({ isConnected, isDemoMode });

module.exports = { connectDB, getDbStatus };
