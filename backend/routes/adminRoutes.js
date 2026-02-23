const express = require('express');
const router = express.Router();
const { createOrganizer, getOrganizers, deleteOrganizer } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

router.route('/organizers')
  .post(protect, createOrganizer)
  .get(protect, getOrganizers);

router.route('/organizers/:id')
  .delete(protect, deleteOrganizer);

module.exports = router;