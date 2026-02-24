//this file acts as the entry point for all authentication requests
const express = require('express');
const router = express.Router();
const { registerUser, loginUser , forgotPassword, resetPassword} = require('../controllers/authController');

//protect user data by authentication
const { protect } = require('../middleware/authMiddleware');
//router.get('/profile', protect, getUserProfile); //commented for debug

// Define the paths
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;