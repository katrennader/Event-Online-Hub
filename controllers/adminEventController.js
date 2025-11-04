const { StatusCodes } = require("http-status-codes")
const User = require('../models/userModel')
const Event = require('../models/eventModel')

const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find({}).populate("createdBy", "username role");
        if (!events || events.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: " No Events are created " })
        }
        res.status(StatusCodes.OK).json({ message: "Here all events", count: events.length, data: events })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "something went wrong, please try again", error: error.message })
    }
}

const getSingleEvent = async (req, res) => {
    try {
        const { title } = req.params;
        const event = await Event.findOne({ title }).populate("createdBy", "username role");
        if (!event) {
            return res.status(StatusCodes.NOT_FOUND)
                .json({ message: `Event '${title}' not found in the system` })
        }
        res.status(StatusCodes.OK)
            .json({ message: `Here is  event with ${title}`, event })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "something went wrong, please try again", error: error.message })
    }
}

const updateEvent = async (req, res) => {
    try {
        const { title } = req.params;
        const event = await Event
            .findOneAndUpdate(
                { title },
                req.body,
                { new: true, runValidators: true }) // to return new updated version and also apply all validations
        if (!event) {
            return res.status(StatusCodes.NOT_FOUND)
                .json({ message: `Event '${title}' not found in the system` })
        }
        res.status(StatusCodes.OK)
            .json({ message: `Event '${title}' was successfully updated`, date: event })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "something went wrong, please try again", error: error.message })
    }
}

const deleteEvent = async (req, res) => {
    try {
        const { title } = req.params
        const event = await Event.findOneAndDelete({ title });
        if (!event) {
            return res.status(StatusCodes.NOT_FOUND)
                .json({ message: `Event '${title}' not found in the system` })
        }
        res.status(StatusCodes.OK)
            .json({ message: `Event '${title}' was successfully deleted` })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "something went wrong, please try again", error: error.message })

    }
}

module.exports ={
    getAllEvents,
    updateEvent,
    deleteEvent, 
    getSingleEvent
}