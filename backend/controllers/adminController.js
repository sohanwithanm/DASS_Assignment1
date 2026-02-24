const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Admin creates an Organizer
// @route   POST /api/admin/organizers
const createOrganizer = async (req, res) => {
  try {
    
    const { name, email, password, category, description, contactNumber } = req.body;

    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized as an admin' });
    }

    // Check for category arrival (error checking)
    if (!category) {
      return res.status(400).json({ message: 'Category is required for Organizers' });
    }

    //Same encryption as auth to ensure smooth flow
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const organizer = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'Organizer',
      category, 
      description,
      contactNumber,
      isApproved: true
    });

    res.status(201).json({ message: 'Organizer created successfully', organizer });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all Organizers
// @route   GET /api/admin/organizers
const getOrganizers = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Not authorized' });
    
    const organizers = await User.find({ role: 'Organizer' }).select('-password');
    res.json(organizers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete/Remove an Organizer
// @route   DELETE /api/admin/organizers/:id
const deleteOrganizer = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Not authorized' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Organizer not found' });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Organizer removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrganizer, getOrganizers, deleteOrganizer };