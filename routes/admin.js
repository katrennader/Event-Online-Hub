const express = require('express')
const adminRouter = express.Router()
const verifyToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');
const {getAllOrganizers,getAllAttendees,getAllUsers,deleteUser,updateUserRole ,getSingleUser } = require('../controllers/adminUserController')
const {getAllEvents,updateEvent,deleteEvent, getSingleEvent} = require('../controllers/adminEventController')

adminRouter.use(verifyToken, authorizeRoles("Admin"));

// Event management routes 
adminRouter.route('/events').get(getAllEvents);
adminRouter.route('/events/:title').delete(deleteEvent).patch(updateEvent).get(getSingleEvent);

// USER management routes 
adminRouter.route('/').get(getAllUsers);
adminRouter.route('/organizers').get(getAllOrganizers);
adminRouter.route('/attendees').get(getAllAttendees);
adminRouter.route('/:username').delete(deleteUser).patch(updateUserRole).get(getSingleUser);




module.exports = adminRouter