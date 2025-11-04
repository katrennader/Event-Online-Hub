const express = require('express');
const attendeeRouter = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const {
  viewUpcomingEvents,
  getSingleEvent,
  registerForEvent,
  cancelEvent,
  viewMyRegisteredEvents
} = require("../controllers/attendeecontroller");

attendeeRouter.use(verifyToken, authorizeRoles("Admin", "Organizer", "Attendee"));

attendeeRouter.get('/events', viewUpcomingEvents);
attendeeRouter.get('/myevents', viewMyRegisteredEvents);
attendeeRouter.route('/events/:title').get(getSingleEvent)
attendeeRouter.route('/events/:title/register').post(registerForEvent)
attendeeRouter.route('/events/:title/cancel').delete(cancelEvent);

module.exports = attendeeRouter;
