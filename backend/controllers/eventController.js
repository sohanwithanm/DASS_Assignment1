const Event = require('../models/Event');
const User = require('../models/User'); // for organizer name search?

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Organizer Only)
const createEvent = async (req, res) => {
  try {
    // protect middleware gives us access to req.user
    if (req.user.role !== 'Organizer') {
      return res.status(403).json({ message: 'Forbidden: Only Organizers can create events.' });
    }

    // extract event details
    const {
      name, description, type, eligibility, registrationDeadline,
      startDate, endDate, registrationLimit, registrationFee,
      eventTags, merchandiseDetails
    } = req.body;

    const event = await Event.create({
      name,
      description,
      type,
      eligibility,
      registrationDeadline,
      startDate,
      endDate,
      registrationLimit,
      organizerId: req.user._id, 
      registrationFee,
      eventTags,
      merchandiseDetails,
      status: 'Draft' 
    });

    res.status(201).json(event);

  } catch (error) {
    console.error("Event Creation Error:", error.message);
    res.status(400).json({ message: error.message });
  }
};

const Participation = require('../models/Participation');

// @desc    Register for an event
// @route   POST /api/events/:id/register
// @access  Private (Participant Only)
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    //checks

    if (req.user.role !== 'Participant') {
      return res.status(403).json({ message: 'Only participants can register for events' });
    }

    if (event.eligibility === 'IIIT Only' && !req.user.isIIITStudent) {
      return res.status(403).json({ message: 'This event is restricted to IIIT Students only.' });
    }
    if (event.eligibility === 'Non-IIIT Only' && req.user.isIIITStudent) {
      return res.status(403).json({ message: 'This event is for external participants only.' });
    }

    if (new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    const currentRegistrations = await Participation.countDocuments({ event: req.params.id });
    if (currentRegistrations >= event.registrationLimit) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // create participation
    const participation = await Participation.create({
      event: req.params.id,
      participant: req.user._id
    });

    event.registrationCount += 1;
    if (event.type === 'Merchandise') event.merchandiseDetails.stockQuantity -= 1;
    await event.save();

    res.status(201).json({ message: 'Successfully registered for event', participation });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all published events (The Feed)
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const { 
      search, type, eligibility, startDate, endDate, 
      trending, followedOrganizers 
    } = req.query;


    let query = { 
      status: { $in: ['Published', 'Ongoing'] } 
    };

    // partial seearch
    if (search) {
      const matchingOrganizers = await User.find({
        role: 'Organizer',
        name: { $regex: search, $options: 'i' } // i makes it case insensitive

      }).select('_id');
      
      const organizerIds = matchingOrganizers.map(org => org._id);
      // fuzzy search
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { organizerId: { $in: organizerIds } }
      ];
    }

    // filters
    if (type) query.type = type;
    if (eligibility) query.eligibility = { $regex: eligibility, $options: 'i' };

    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate); 
    }

    // list of comma separated IDs
    if (followedOrganizers) {
      const orgIds = followedOrganizers.split(',');
      
      if (query.$or) {
        query = {
          $and: [
            { organizerId: { $in: orgIds } },
            { $or: query.$or },
            { status: { $in: ['Published', 'Ongoing'] } }
          ]
        };
      } else {
        query.organizerId = { $in: orgIds };
      }
    }

    let queryBuilder;
    
    if (trending === 'true') {
      // top 5/24h logic
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      query.createdAt = { $gte: oneDayAgo };
      
      queryBuilder = Event.find(query)
        .populate('organizerId', 'name category')
        .sort({ registrationLimit: -1, createdAt: -1 }) //sort desc
        .limit(5);
    } else {
      // standard: sort by time
      queryBuilder = Event.find(query)
        .populate('organizerId', 'name category')
        .sort({ startDate: 1 });
    }

    const events = await queryBuilder;
    res.json(events);

  } catch (error) {
    console.error("Fetch Events Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single event details
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizerId', 'organizationName description');

    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in organizer's events
// @route   GET /api/events/my-events
// @access  Private (Organizer)
const getOrganizerEvents = async (req, res) => {
  try {
    if (req.user.role !== 'Organizer') {
      return res.status(403).json({ message: 'Access denied. Organizers only.' });
    }

    const events = await Event.find({ organizerId: req.user._id }).sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Organizer)
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // SECURITY CHECK: Make sure the logged-in organizer actually owns this event
    if (event.organizerId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this event' });
    }

    // Update the event with new data from the request body
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Returns the updated document and runs schema checks
    );

    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all participants for a specific event
// @route   GET /api/events/:id/participants
// @access  Private (Organizer)
const getEventParticipants = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizerId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to view these participants' });
    }

    const participants = await Participation.find({ event: req.params.id })
      .populate('participant', 'name email contactNumber collegeName isIIITStudent');

    res.json(participants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Organizer)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.organizerId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in participant's registered events
// @route   GET /api/events/my-registrations
// @access  Private (Participant)
const getMyRegistrations = async (req, res) => {
  try {
    if (req.user.role !== 'Participant') {
      return res.status(403).json({ message: 'Access denied. Participants only.' });
    }

    const participations = await Participation.find({ participant: req.user._id })
      .populate({
        path: 'event',
        select: 'name type startDate endDate status registrationFee organizerId',
        populate: { path: 'organizerId', select: 'name' }
      })
      .sort({ createdAt: -1 });

    res.json(participations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEvent,
  registerForEvent,
  getEvents, 
  getEventById,
  getOrganizerEvents,
  updateEvent,         
  getEventParticipants,
  deleteEvent,
  getMyRegistrations  
};

