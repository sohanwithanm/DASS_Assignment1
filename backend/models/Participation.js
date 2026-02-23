const mongoose = require('mongoose');

const participationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  participant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Registered', 'Attended', 'Cancelled'],
    default: 'Registered'
  }
}, { timestamps: true });

// Prevent a user from registering for the same event twice
participationSchema.index({ event: 1, participant: 1 }, { unique: true });

module.exports = mongoose.model('Participation', participationSchema);