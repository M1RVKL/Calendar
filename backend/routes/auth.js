const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const logger = require('../utils/logger');
const router = express.Router();

// Register
router.post('/register', logger.logRoute('INFO'), async (req, res) => {
  try {
    const { email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    logger.logError(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', logger.logRoute('INFO'), async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    logger.logError(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Google OAuth (placeholder)
router.get('/google', (req, res) => {
  // TODO: Implement Gmail API OAuth2
  res.status(501).json({ message: 'Google OAuth not implemented yet' });
});

// Password reset request (placeholder)
router.post('/reset-password', async (req, res) => {
  // TODO: Implement password reset with Gmail API
  res.status(501).json({ message: 'Password reset not implemented yet' });
});

// Password reset confirm (placeholder)
router.post('/reset-password/confirm', async (req, res) => {
  // TODO: Implement password reset confirmation
  res.status(501).json({ message: 'Password reset confirm not implemented yet' });
});

module.exports = router; 