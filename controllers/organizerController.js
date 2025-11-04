const {StatusCodes} = require('http-status-codes')
const Event = require('../models/eventModel')

/*
Organizer functions (can access only events whose created by )
1. add event 
2. edit event 
3. delete event 
4. get single event by title 
5. get all events 
*/

const addEvent = async (req,res)=>{
    try {
    const {title , description , date, location, category, capacity} = req.body
    if(!title || !description ||!date || !location || !category || !capacity){
        return res.status(StatusCodes.BAD_REQUEST)
        .json({message :"please provide all requirments (title, description, date, location, category, capacity)"})
    }
    const existingEvent = await Event.findOne({ title });
    if (existingEvent){
        return res.status(StatusCodes.BAD_REQUEST)
        .json({message :`Event with  name ${title} already exists`})
    }
    const event = new Event({
        title, description , date , location, category, capacity, createdBy: req.user.id
    })
    await event.save()
    res.status(StatusCodes.CREATED)
    .json({success :true , message :`Event with name ${title} was created successfully by ${req.user.username}`,event})
    
    } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ msg: "something went wrong, please try again", error: error.message })
    }
}

const updateEvent = async(req,res)=>{
    // update event propertiies (title , description ,date )
    try {
       const {title} = req.params
       const {description ,date, location, category, capacity} = req.body
       // check that this organizer has access on this event (has access only on events that he created )
       const event = await Event.findOne({title , createdBy :req.user.id})
      if (!event) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `Event '${title}' not found or you don't have permission to update it.`,
      });
    }
     // Update allowed fields
    if (description) event.description = description;
    if (date) event.date = date;
    if (location) event.location = location;
    if (category) event.category = category;
    if (capacity) event.capacity = capacity;

    await event.save();
      res.status(StatusCodes.OK).json({
      message: `Event '${title}' updated successfully`,
      event,
    });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ msg: "something went wrong, please try again", error: error.message })
    }
}

const deleteEvent = async(req,res)=>{
      try {
       const {title} = req.params
       // check that this organizer has access on this event (has access only on events that he created )
       const event = await Event.findOneAndDelete({title , createdBy :req.user.id})
      if (!event) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `Event '${title}' not found or you don't have permission to delete it.`,
      });
    }
      res.status(StatusCodes.OK).json({
      message: `Event '${title}' deleted successfully`
    });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ msg: "something went wrong, please try again", error: error.message })
    }
}

const getAllEvents = async(req,res)=>{
  try {
    const events = await Event.find({createdBy :req.user.id})
    if(!events || events.length === 0){
        return res.status(StatusCodes.NOT_FOUND)
        .json({message:`NO Events are created by this organizer`})
    }
    res.status(StatusCodes.OK)
    .json({message :`All Events are created by ${req.user.id}`,count :events.length,  events})
  } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ msg: "something went wrong, please try again", error: error.message })
  }
}
const getSingleEvent = async(req,res)=>{
  try {
    const {title} = req.params
    const event = await Event.findOne({title , createdBy :req.user.id})
    if(!event){
        return res.status(StatusCodes.NOT_FOUND)
        .json({message:`NO Event with name ${title} are created by ${req.user.id}`})
    }
    res.status(StatusCodes.OK)
    .json({message :`Here is  event with ${title} created by ${req.user.id}`, event})
  } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ msg: "something went wrong, please try again", error: error.message })
  }
}





module.exports ={
    addEvent,
    updateEvent,
    deleteEvent,
    getAllEvents, 
    getSingleEvent
}