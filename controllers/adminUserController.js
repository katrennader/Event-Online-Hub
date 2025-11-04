const { StatusCodes } = require("http-status-codes")
const User = require('../models/userModel')
const Event = require('../models/eventModel')
/*
Admin functions 
1. get All events 
2. get all organizers 
3. get all attendees 
4. delete user
6. delete event 
7. edit event 
8. edit role of user 
9. get all users in system
 */

const getAllOrganizers = async (req, res) => {
    try {
        const organizers = await User
            .find({ role: "Organizer" })
            .sort({ username: 1 })
            .select("-password -__v"); // get all document content except passwrod 
        if (!organizers || organizers.length === 0) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ message: "No users with the role 'Organizer' found" })
        }
        res.status(StatusCodes.OK).json({ message: "Here all organizers ", count: organizers.length, data: organizers })

    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "something went wrong, please try again", error: error.message })
    }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .select("username role")
            .sort({ username: 1 })
        if (!users || users.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "No USers are created" })
        }
        res.status(StatusCodes.OK).json({ message: "Here all USers inside system ", count: users.length, data: users })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "something went wrong, please try again", error: error.message })

    }
}
const getSingleUser = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).select("username role email isVerified");
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND)
                .json({ message: `User with username '${username}' not found in the system` });
        }
        res.status(StatusCodes.OK).json({ message: `Here is user with username '${username}'`, data: user });
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "something went wrong, please try again", error: error.message })
    }
}

const getAllAttendees = async (req, res) => {
    try {
        const attendees = await User
            .find({ role: "Attendee" })
            .sort({ username: 1 })
            .select("-password -__v"); // get all document content except passwrod 
        if (!attendees || attendees.length === 0) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ message: "No users with the role 'Attendee' found" })
        }
        res.status(StatusCodes.OK).json({ message: "Here all attendees ", count: attendees.length, data: attendees })

    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "something went wrong, please try again", error: error.message })
    }
}
const deleteUser = async (req, res) => {
    try {
        const { username } = req.params
        const user = await User.findOneAndDelete({ username });
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND)
                .json({ message: `User '${username}' not found in the system` })
        }
        res.status(StatusCodes.OK)
            .json({ message: `User '${username}' was successfully deleted` })
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "something went wrong, please try again", error: error.message })

    }
}

const updateUserRole = async (req, res) => {
  try {
    const { username } = req.params;
    const { role } = req.body;
    // Ensure role is provided
    if (!role) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Please provide a new role to update" });
    }
    const user = await User.findOneAndUpdate(
      { username },
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `User '${username}' not found in the system` });
    }

    res.status(StatusCodes.OK).json({
      message: `User '${username}' role was successfully updated by admin`,
      data: user,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Something went wrong, please try again",
      error: error.message,
    });
  }
};







module.exports = {
    getAllOrganizers,
    getAllAttendees,
    getAllUsers,
    deleteUser,
    updateUserRole,
    getSingleUser

}
