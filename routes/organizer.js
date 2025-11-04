const express = require('express')
const organizerRouter = express.Router()
const {addEvent,updateEvent,deleteEvent,getAllEvents, getSingleEvent} = require('../controllers/organizerController')
const verifyToken = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

organizerRouter.use(verifyToken, authorizeRoles("Admin", "Organizer"));


organizerRouter.route('/events').get(getAllEvents).post(addEvent)
organizerRouter.route('/events/:title')
.get(getSingleEvent)
.delete(deleteEvent)
.patch(updateEvent)





module.exports = organizerRouter