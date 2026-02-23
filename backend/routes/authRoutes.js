//This file acts as the entry point for all authentication-related requests. It uses the Express Router to define the "paths" that the outside world (like your React frontend or Postman) can use.
//Endpoint Mapping: It maps specific URL paths to the functions in your controller.
//POST /register: This "route" is used for creating new accounts. We use POST because we are sending sensitive data (password) that should not be visible in the URL.
//POST /login: This route is used to verify existing users.

const express = require('express');
const router = express.Router();
const { registerUser, loginUser , forgotPassword, resetPassword} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// The 'protect' function runs BEFORE 'getUserProfile'
//router.get('/profile', protect, getUserProfile);

// Define the paths
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;