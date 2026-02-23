const express = require('express');
const router = express.Router();

const { 
  createEvent, 
  registerForEvent, 
  getEvents, 
  getEventById,
  getOrganizerEvents,
  updateEvent,
  getEventParticipants,
  deleteEvent,
  getMyRegistrations 
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');


// Public events list
router.get('/', getEvents);

router.get('/my-events', protect, getOrganizerEvents);
router.get('/my-registrations', protect, getMyRegistrations);

//Public search for single event
router.get('/:id', getEventById);

// Route: POST /api/events
// Protected Routes
router.post('/', protect, createEvent);
router.put('/:id', protect, updateEvent); 
router.post('/:id/register', protect, registerForEvent);
router.get('/:id/participants', protect, getEventParticipants);
router.delete('/:id', protect, deleteEvent);



module.exports = router;
