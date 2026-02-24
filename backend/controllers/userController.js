const User = require('../models/User');
const Participation = require('../models/Participation');

// @desc    Get user profile (Self)
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
      const joinedEvents = await Participation.find({ participant: user._id })
        .populate({
          path: 'event',
          select: 'name startDate endDate status type'
        });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contactNumber: user.contactNumber || '',
        collegeName: user.collegeName || '',
        areasOfInterest: user.areasOfInterest || [],
        followedOrganizers: user.followedOrganizers || [],
        organizationName: user.organizationName || '',
        description: user.description || '',
        joinedEvents 
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      //editable
      user.name = req.body.name || user.name;
      user.contactNumber = req.body.contactNumber || user.contactNumber;

      if (user.role === 'Participant') {
        user.collegeName = req.body.collegeName || user.collegeName;
        if (req.body.areasOfInterest) user.areasOfInterest = req.body.areasOfInterest;
        if (req.body.followedOrganizers) user.followedOrganizers = req.body.followedOrganizers;
      }

      if (user.role === 'Organizer') {
        user.organizationName = req.body.organizationName || user.organizationName;
        user.description = req.body.description || user.description;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        areasOfInterest: updatedUser.areasOfInterest,
        followedOrganizers: updatedUser.followedOrganizers,
        organizationName: updatedUser.organizationName,
        description: updatedUser.description
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all organizers
// @route   GET /api/users/organizers
// @access  Public (or Private for Participants)
const getOrganizers = async (req, res) => {
  try {
    // fetch only organizer
    const organizers = await User.find({ role: 'Organizer' })
      .select('name category description contactEmail');
    
    res.json(organizers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUserProfile, updateUserProfile, getOrganizers };