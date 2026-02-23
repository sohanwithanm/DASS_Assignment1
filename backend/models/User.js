const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'] 
  },
  
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        // If the user intends to be an IIIT Participant, we enforce domain logic
        // Section 4.1.1: Must register using IIIT-issued email ID only
        if (this.role === 'Participant' && this.isIIITStudent) {
            return v.endsWith('@students.iiit.ac.in') || v.endsWith('@research.iiit.ac.in');
        }
        return true;
      },
      message: 'IIIT Participants must use an @students.iiit.ac.in or @research.iiit.ac.in email.'
    }
  },
  
  password: { 
    type: String, 
    required: [true, 'Password is required'] 
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  role: {
    type: String,
    enum: ['Participant', 'Organizer', 'Admin'],
    default: 'Participant'
  },

  isIIITStudent: {
    type: Boolean,
    default: false
  },

  // Therefore, self-registered users are always Participants and 'isApproved' is likely implicit or true.
  // Organizers created by Admin are approved by default.
  isApproved: {
    type: Boolean,
    default: true 
  },

  // These are not required at Registration (Section 4.1), but are editable later.
  contactNumber: {
    type: String,
    trim: true,
    default: ''
  },

  collegeName: {
    type: String,
    trim: true,
    default: ''
  },

  // These are required only if the user is an Organizer.
  category: {
    type: String, // e.g., technical, cultural, etc.
    required: function() { return this.role === 'Organizer'; }
  },
  
  description: {
    type: String,
    required: function() { return this.role === 'Organizer'; }
  },
  areasOfInterest: { type: [String], default: [] },
  followedOrganizers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]

}, { 
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);