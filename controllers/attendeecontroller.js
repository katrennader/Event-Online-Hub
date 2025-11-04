const { StatusCodes } = require("http-status-codes")
const Event = require("../models/eventModel")

/*
Attendees functions
1. view all upcoming events 
2. register for specific event 
3. cancel registeration for this event
4.View all events they registered for
5.View a single event by title
*/
const viewUpcomingEvents = async (req, res) => {
    try {
        const currentDate = new Date();
        // Get only events with a future date, sorted ascending
        const events = await Event.find({ date: { $gte: currentDate } }).sort({ date: 1 });
        if (!events || events.length === 0) {
            return res.status(StatusCodes.NOT_FOUND)
                .json({ message: " NO  upcoming Events are found" })
        }
        res.status(StatusCodes.OK)
            .json({ message: "Here ara all upcoming events", count: events.length, events })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "something went wrong, please try again", error: error.message })
    }
}
const getSingleEvent = async(req,res)=>{
  try {
    const {title} = req.params
    const event = await Event.findOne({title , createdBy :req.user.username})
    if(!event){
        return res.status(StatusCodes.NOT_FOUND)
        .json({message:`NO Event with name ${title} are created by ${req.user.username}`})
    }
    res.status(StatusCodes.OK)
    .json({message :`Here is  event with ${title} created by ${req.user.username}`, event})
  } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ msg: "something went wrong, please try again", error: error.message })
  }
}

const registerForEvent = async (req, res) => {
  try {
    const { title } = req.params;
    const username = req.user.username;

    if (!username) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "User not authenticated. Please log in again." });
    }
    const event = await Event.findOne({ title });
    if (!event) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `Event "${title}" not found.` });
    }

    if (event.capacity && event.attendees.length >= event.capacity) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Event is already full , you can't register for it." });
    }

    if (event.attendees.includes(username)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "You are already registered for this event." });
    }

    event.attendees.push(req.user.username);
    await event.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: `Successfully registered for event "${title}".`,
      totalAttendees: event.attendees.length,
      event: {
        title: event.title,
        location: event.location,
        date: event.date,
      },
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong, please try again.",
      error: error.message,
    });
  }
};

module.exports = { registerForEvent };


const cancelEvent = async (req, res) => {
  try {
    const { title } = req.params;
    const username = req.user.username; 

    // check first this event exists
    const event = await Event.findOne({ title });
    if (!event) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `Event "${title}" not found.` });
    }

    //  Check if user is already registered  (found his name in array of attendess in event model )
    if (!event.attendees.includes(username)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "You are Notregistered for this event." });
    }

    //Remove the username from attendees list
    event.attendees = event.attendees.filter(
      (attendee) => attendee !== username
    );
    await event.save();
    res.status(StatusCodes.OK).json({
      message: `Successfully canceled registration for event "${title}".`,
      totalAttendees: event.attendees.length,
      event:{
        title: event.title,
        location: event.location,
        date: event.date,
      },
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Something went wrong, please try again.",
      error: error.message,
    });
  }
}

const viewMyRegisteredEvents = async (req, res) => {
  try {
    const username = req.user.username;
    const events = await Event.find({ attendees: username });

    if (!events || events.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `No events found for attendee "${username}".` });
    }
    res.status(StatusCodes.OK).json({
      message: `Here are all events registered by "${username}".`,
      count: events.length,
      events,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Something went wrong, please try again.",
      error: error.message,
    });
  }
};


module.exports ={
    viewUpcomingEvents,
    getSingleEvent, 
    registerForEvent, 
    cancelEvent,
    viewMyRegisteredEvents
}