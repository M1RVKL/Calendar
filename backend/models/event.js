const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  note: { type: String, required: true },
  importance: { type: String, enum: ['optional', 'important', 'mandatory'], default: 'optional' },
  startTime: { type: String }, // e.g. '14:00'
  endTime: { type: String },   // e.g. '15:00'
  repeat: {
    type: {
      type: String,
      default: 'none',
  },
    daysOfWeek: [Number],
    interval: { type: Number, default: 1 },
    endDate: Date
  },
  notify: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema); 