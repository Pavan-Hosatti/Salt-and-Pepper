const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getDbStatus } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

const DEMO_USER = {
  _id: 'demo_user_001',
  name: 'Demo Manager',
  email: 'demo@storeos.ai',
  password: '$2a$10$XQx5Y3v9Rq1H8K3Z5v7o4eW1Q2r3t4u5v6w7x8y9z0a1b2c3d4e5f'
};

let User;
try {
  User = require('../models/User');
} catch (e) {
  User = null;
}

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const { isDemoMode } = getDbStatus();
    if (isDemoMode) {
      const token = jwt.sign({ id: 'new_user_001', email, name }, JWT_SECRET, { expiresIn: '24h' });
      return res.status(201).json({ token, user: { id: 'new_user_001', name, email } });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    return res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('[AUTH] Signup error:', err.message);
    return res.status(500).json({ error: 'Server error during signup.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const { isDemoMode } = getDbStatus();

    if (email === 'demo@storeos.ai' && password === 'demo123') {
      const token = jwt.sign({ id: DEMO_USER._id, email: DEMO_USER.email, name: DEMO_USER.name }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ token, user: { id: DEMO_USER._id, name: DEMO_USER.name, email: DEMO_USER.email } });
    }

    if (isDemoMode) {
      return res.status(401).json({ error: 'Invalid credentials. Use demo@storeos.ai / demo123' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('[AUTH] Login error:', err.message);
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

router.get('/demo', (req, res) => {
  const token = jwt.sign({ id: DEMO_USER._id, email: DEMO_USER.email, name: DEMO_USER.name }, JWT_SECRET, { expiresIn: '24h' });
  return res.json({ token, user: { id: DEMO_USER._id, name: DEMO_USER.name, email: DEMO_USER.email } });
});

module.exports = router;
