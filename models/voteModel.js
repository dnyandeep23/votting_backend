const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  party: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Party',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure one vote per user
voteSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
