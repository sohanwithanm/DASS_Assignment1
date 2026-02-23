const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile , getOrganizers} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// All user routes are protected as per security requirements 
router
    .get('/organizers', getOrganizers)
    .route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

module.exports = router;