const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  // CORE ATTRIBUTES (Required for all events)
  name: { 
    type: String, 
    required: [true, 'Event Name is required'] 
  },
  description: { 
    type: String, 
    required: [true, 'Event Description is required'] 
  },
  type: { 
    type: String, 
    enum: ['Normal', 'Merchandise'], 
    required: [true, 'Event Type must be Normal or Merchandise'] 
  },
  eligibility: { 
    type: String, 
    enum: ['IIIT Only', 'Non-IIIT Only', 'All'],
    default: 'All',
    required: [true, 'Eligibility criteria is required'] 
  },
  registrationDeadline: { 
    type: Date, 
    required: true 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  registrationLimit: { 
    type: Number, 
    required: true 
  },

  // ORGANIZER REFERENCE
  organizerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  // NORMAL EVENT SPECIFIC ATTRIBUTES
  registrationFee: {
    type: Number,
    required: function() { return this.type === 'Normal'; }
  },
  eventTags: {
    type: [String],
    default: []
  },
  customFormFields: [{
    label: { type: String, required: true },
    fieldType: { type: String, enum: ['text', 'dropdown', 'checkbox', 'file'], required: true },
    isRequired: { type: Boolean, default: false },
    options: { type: [String], default: [] } // Only populated if fieldType is 'dropdown'
  }],

  // MERCHANDISE EVENT SPECIFIC ATTRIBUTES
  merchandiseDetails: {
    variants: { type: [String], default: [] }, // e.g., sizes, colors
    stockQuantity: { 
      type: Number, 
      required: function() { return this.type === 'Merchandise'; } 
    },
    purchaseLimitPerParticipant: { 
      type: Number, 
      required: function() { return this.type === 'Merchandise'; } 
    }
  },

  // STATUS TRACKING 
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Ongoing', 'Completed', 'Closed'],
    default: 'Draft'
  },

  registrationCount: {
    type: Number,
    default: 0
  }



}, { 
  timestamps: true 
});

module.exports = mongoose.model('Event', eventSchema);