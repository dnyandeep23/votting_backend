const mongoose = require('mongoose');

const partySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  symbol: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    default: '#FF9933'
  },
  description: {
    type: String,
    trim: true
  },
  leader: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },
  // Translations for different languages
  translations: {
    en: {
      name: { type: String, trim: true },
      description: { type: String, trim: true },
      leader: { type: String, trim: true }
    },
    hi: {
      name: { type: String, trim: true },
      description: { type: String, trim: true },
      leader: { type: String, trim: true }
    },
    mr: {
      name: { type: String, trim: true },
      description: { type: String, trim: true },
      leader: { type: String, trim: true }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
partySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Party', partySchema);
