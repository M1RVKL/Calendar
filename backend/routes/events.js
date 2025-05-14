const express = require('express');
const Event = require('../models/event');
const logger = require('../utils/logger');
const authProxy = require('../utils/authProxy');
const router = express.Router();

// Get all events for user
router.get('/', authProxy, logger.logRoute('INFO'), async (req, res) => {
  try {
    const events = await Event.find({ userId: req.user.id });
    res.json(events);
  } catch (err) {
    logger.logError(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create event
router.post('/', authProxy, logger.logRoute('INFO'), async (req, res) => {
  try {
    const { date, note, importance, startTime, endTime, notify } = req.body;
    const event = new Event({
      userId: req.user.id,
      date,
      note,
      importance,
      startTime,
      endTime,
      notify,
    });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    logger.logError(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event
router.put('/:id', authProxy, logger.logRoute('INFO'), async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    logger.logError(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event
router.delete('/:id', authProxy, logger.logRoute('INFO'), async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    logger.logError(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 